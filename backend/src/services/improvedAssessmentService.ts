import finalAssessmentData from '../data/final-assessment-v3.json';
import { WeightedAIPromptService } from './weightedAIPromptService';

export interface ImprovedQuestion {
  id: string;
  order: number;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'free_text' | 'matrix' | 'combined';
  category: string;
  required: boolean;
  appliesTo?: string[];
  branchingQuestion?: boolean;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    nextPath?: string;
    category?: string;
    sectors?: string[];
  }>;
  fields?: {
    [key: string]: {
      type: string;
      label: string;
      options?: string[];
      required?: boolean;
      validation?: string;
      placeholder?: string;
      maxLength?: number;
    };
  };
  subjects?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  ratingScale?: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
}

export interface ImprovedAssessment {
  version: string;
  title: string;
  description: string;
  assessmentType: string;
  questions: ImprovedQuestion[];
  pathLogic: {
    [key: string]: {
      name: string;
      description: string;
      questionFlow: string[];
      totalQuestions: number;
      focusAreas: string[];
      aiPromptStrategy: string;
    };
  };
  careerMapping: {
    [key: string]: {
      primarySectors: string[];
      careers: string[];
    };
  };
}

export interface FinalAssessmentResponse {
  assessmentVersion: 'v3';
  pathTaken: 'hard_hat' | 'non_hard_hat' | 'unable_to_decide' | 'decided' | 'undecided';
  responses: { [key: string]: any };
  completedAt: Date;
}

export class FinalAssessmentService {
  /**
   * Get the complete final assessment structure
   */
  static getAssessment(): ImprovedAssessment {
    return finalAssessmentData as ImprovedAssessment;
  }

  /**
   * Get questions for a specific path
   */
  static getQuestionsForPath(path: string): ImprovedQuestion[] {
    const assessment = this.getAssessment();
    
    // Map legacy paths to new paths
    let actualPath = path;
    if (path === 'hard_hat' || path === 'non_hard_hat') {
      actualPath = 'decided';
    } else if (path === 'unable_to_decide') {
      actualPath = 'undecided';
    }
    
    const pathConfig = assessment.pathLogic[actualPath];
    
    if (!pathConfig) {
      throw new Error(`Invalid path: ${path} (mapped to ${actualPath})`);
    }

    return pathConfig.questionFlow
      .map(questionId => assessment.questions.find(q => q.id === questionId))
      .filter((q): q is ImprovedQuestion => q !== undefined);
  }

  /**
   * Get the branching question that determines the path
   */
  static getBranchingQuestion(): ImprovedQuestion | null {
    const assessment = this.getAssessment();
    // Return the first branching question found (could be either decided or undecided version)
    return assessment.questions.find(q => q.branchingQuestion) || null;
  }

  /**
   * Determine path based on work preference response
   */
  static determinePath(workPreferenceResponse: string): string {
    // In the simplified v3, we determine path based on the initial routing
    // If they select specific categories, they go to decided path
    // If they select "unable_to_decide", they go to undecided path
    switch (workPreferenceResponse) {
      case 'unable_to_decide':
        return 'undecided'; // Student needs exploration
      default:
        return 'decided'; // Student chose specific direction
    }
  }

  /**
   * Get universal questions (apply to all paths)
   */
  static getUniversalQuestions(): ImprovedQuestion[] {
    const assessment = this.getAssessment();
    return assessment.questions.filter(q => 
      !q.appliesTo || (q.appliesTo.includes('decided') && q.appliesTo.includes('undecided'))
    );
  }

  /**
   * Validate improved assessment responses
   */
  static validateResponses(responses: { [key: string]: any }, path: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Map legacy paths to new paths for validation
    let actualPath = path;
    if (path === 'hard_hat' || path === 'non_hard_hat') {
      actualPath = 'decided';
    } else if (path === 'unable_to_decide') {
      actualPath = 'undecided';
    }
    
    const questions = this.getQuestionsForPath(actualPath);

    for (const question of questions) {
      const response = responses[question.id];

      // Check required fields
      if (question.required && (!response || response === '')) {
        errors.push(`${question.text} is required`);
        continue;
      }

      // Skip validation if no response provided for optional questions
      if (!response) continue;

      // Validate specific question types
      switch (question.type) {
        case 'combined':
          if (question.fields) {
            for (const [fieldKey, fieldConfig] of Object.entries(question.fields)) {
              const fieldValue = response[fieldKey];
              
              if (fieldConfig.required && (!fieldValue || fieldValue === '')) {
                errors.push(`${fieldConfig.label} is required`);
              }

              // Validate ZIP code format
              if (fieldConfig.validation === 'zipcode' && fieldValue) {
                if (!/^\d{5}$/.test(fieldValue)) {
                  errors.push('ZIP code must be exactly 5 digits');
                }
              }
            }
          }
          break;

        case 'multiple_choice':
          if (!Array.isArray(response)) {
            errors.push(`${question.text} must be an array of selections`);
          } else {
            if (question.minSelections && response.length < question.minSelections) {
              errors.push(`${question.text} requires at least ${question.minSelections} selections`);
            }
            if (question.maxSelections && response.length > question.maxSelections) {
              errors.push(`${question.text} allows at most ${question.maxSelections} selections`);
            }
          }
          break;

        case 'matrix':
          if (typeof response !== 'object' || Array.isArray(response)) {
            errors.push(`${question.text} must be an object with subject ratings`);
          } else {
            // For the new 1-5 rating system, all subjects must be rated
            if (question.id === 'subject_strengths') {
              const subjects = question.subjects || [];
              const missingRatings: string[] = [];
              
              subjects.forEach((subject: any) => {
                const rating = response[subject.id];
                const numericRating = parseInt(rating);
                
                if (!rating || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
                  missingRatings.push(subject.label);
                }
              });
              
              if (missingRatings.length > 0) {
                errors.push(`Please rate all subjects on a scale of 1-5. Missing ratings for: ${missingRatings.join(', ')}`);
              }
            } else {
              // Legacy validation for other matrix questions
              const ratedSubjects = Object.values(response).filter(rating => 
                rating && rating !== 'not_taken'
              );
              if (ratedSubjects.length === 0) {
                warnings.push('Consider rating at least a few subjects to get better career matches');
              }
            }
          }
          break;

        case 'free_text':
          if (typeof response !== 'string') {
            errors.push(`${question.text} must be a text response`);
          } else {
            if (question.minLength && response.trim().length < question.minLength) {
              errors.push(`${question.text} must be at least ${question.minLength} characters`);
            }
            if (question.maxLength && response.length > question.maxLength) {
              errors.push(`${question.text} must be no more than ${question.maxLength} characters`);
            }
          }
          break;

        case 'single_choice':
          if (question.options && !question.options.some(opt => opt.value === response)) {
            errors.push(`Invalid selection for ${question.text}`);
          }
          break;
      }
    }

    // Path-specific warnings
    if ((path === 'decided' || actualPath === 'decided') && !responses.work_preference_decided) {
      warnings.push('Since you chose a specific work direction, selecting your preference will help us give better guidance');
    }

    if ((path === 'undecided' || actualPath === 'undecided') && !responses.work_preference_undecided) {
      warnings.push('Your responses suggest you might benefit from career exploration activities');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Convert improved assessment responses to weighted format for AI
   */
  static convertToWeightedFormat(responses: { [key: string]: any }, path: string): any {
    // Map legacy paths to new paths
    let actualPath = path;
    if (path === 'hard_hat' || path === 'non_hard_hat') {
      actualPath = 'decided';
    } else if (path === 'unable_to_decide') {
      actualPath = 'undecided';
    }
    
    const weightedData = {
      assessmentVersion: 'v3',
      pathTaken: actualPath,
      responses,
      primaryIndicators: this.extractPrimaryIndicators(responses, actualPath),
      secondaryIndicators: this.extractSecondaryIndicators(responses, actualPath),
      constraints: this.extractConstraints(responses)
    };

    return weightedData;
  }

  /**
   * Extract primary indicators (highest weight factors)
   */
  private static extractPrimaryIndicators(responses: { [key: string]: any }, path: string): any {
    const indicators: any = {};

    // Work preference selection (Weight: 50)
    const workPreferenceKey = path === 'decided' ? 'work_preference_decided' : 'work_preference_undecided';
    const workPreferenceValue = responses[workPreferenceKey];
    
    if (workPreferenceValue) {
      indicators.workPreference = {
        value: workPreferenceValue,
        weight: 50,
        description: this.getWorkPreferenceDescription(workPreferenceValue)
      };
    }

    // For decided path, the specific choice is the work preference
    if (path === 'decided' && workPreferenceValue) {
      indicators.specificDirection = {
        value: workPreferenceValue,
        weight: 35,
        description: 'Student\'s specific career direction choice'
      };
    }

    return indicators;
  }

  /**
   * Extract secondary indicators (medium weight factors)
   */
  private static extractSecondaryIndicators(responses: { [key: string]: any }, path: string): any {
    const indicators: any = {};

    // Education commitment (Weight: 30)
    if (responses.education_commitment) {
      indicators.educationCommitment = {
        value: responses.education_commitment,
        weight: 30,
        isHardConstraint: true,
        description: 'Maximum education level student is willing to pursue'
      };
    }

    // Subject strengths (Weight: 25) - Updated for 1-5 rating system
    if (responses.subject_strengths) {
      const highInterestSubjects = Object.entries(responses.subject_strengths)
        .filter(([_, rating]) => {
          const numericRating = parseInt(rating as string);
          return numericRating >= 4;
        })
        .map(([subject, rating]) => ({ subject, rating: parseInt(rating as string) }))
        .sort((a, b) => b.rating - a.rating);
      
      const moderateInterestSubjects = Object.entries(responses.subject_strengths)
        .filter(([_, rating]) => {
          const numericRating = parseInt(rating as string);
          return numericRating === 3;
        })
        .map(([subject, _]) => subject);

      indicators.subjectStrengths = {
        highInterest: highInterestSubjects.map(s => s.subject),
        highInterestRatings: highInterestSubjects,
        moderateInterest: moderateInterestSubjects,
        weight: 25,
        description: 'Subjects with high interest ratings (4-5) for career alignment'
      };
    }

    return indicators;
  }

  /**
   * Extract constraint factors
   */
  private static extractConstraints(responses: { [key: string]: any }): any {
    const constraints: any = {};

    // Check the unified constraint field
    const constraintText = responses.career_constraints;
    
    if (constraintText && constraintText.trim()) {
      constraints.personalConstraints = {
        value: constraintText,
        weight: 'OVERRIDE',
        description: 'Personal, physical, or situational constraints that may limit career options'
      };
    }

    return constraints;
  }

  /**
   * Get work preference description
   */
  private static getWorkPreferenceDescription(preference: string): string {
    const assessment = this.getAssessment();
    
    // Check both decided and undecided work preference questions
    const decidedWorkQuestion = assessment.questions.find(q => q.id === 'work_preference_decided');
    const undecidedWorkQuestion = assessment.questions.find(q => q.id === 'work_preference_undecided');
    
    let option = decidedWorkQuestion?.options?.find(opt => opt.value === preference);
    if (!option) {
      option = undecidedWorkQuestion?.options?.find(opt => opt.value === preference);
    }
    
    return option?.description || preference;
  }

  /**
   * Get career category description
   */
  private static getCareerCategoryDescription(category: string): string {
    const assessment = this.getAssessment();
    
    // Check hard hat specific options
    const hardHatQuestion = assessment.questions.find(q => q.id === 'hard_hat_specific');
    let option = hardHatQuestion?.options?.find(opt => opt.value === category);
    if (option) return option.description || category;
    
    // Check non hard hat specific options
    const nonHardHatQuestion = assessment.questions.find(q => q.id === 'non_hard_hat_specific');
    option = nonHardHatQuestion?.options?.find(opt => opt.value === category);
    return option?.description || category;
  }

  /**
   * Get assessment progress for a specific path
   */
  static getProgress(responses: { [key: string]: any }, path: string): {
    completedQuestions: number;
    totalQuestions: number;
    percentComplete: number;
    nextQuestion?: ImprovedQuestion;
  } {
    // Map legacy paths to new paths
    let actualPath = path;
    if (path === 'hard_hat' || path === 'non_hard_hat') {
      actualPath = 'decided';
    } else if (path === 'unable_to_decide') {
      actualPath = 'undecided';
    }
    
    const questions = this.getQuestionsForPath(actualPath);
    let completedQuestions = 0;
    let nextQuestion: ImprovedQuestion | undefined;

    for (const question of questions) {
      const response = responses[question.id];
      
      if (response && response !== '' && response !== null && response !== undefined) {
        // For combined fields, check if all required fields are completed
        if (question.type === 'combined' && question.fields) {
          let allFieldsComplete = true;
          for (const [fieldKey, fieldConfig] of Object.entries(question.fields)) {
            if (fieldConfig.required && (!response[fieldKey] || response[fieldKey] === '')) {
              allFieldsComplete = false;
              break;
            }
          }
          if (allFieldsComplete) {
            completedQuestions++;
          } else if (!nextQuestion) {
            nextQuestion = question;
          }
        } else {
          completedQuestions++;
        }
      } else if (!nextQuestion && question.required) {
        nextQuestion = question;
      }
    }

    const totalQuestions = questions.length;
    const percentComplete = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

    return {
      completedQuestions,
      totalQuestions,
      percentComplete,
      nextQuestion
    };
  }

  /**
   * Generate career matches based on improved assessment
   */
  static generateCareerMatches(responses: { [key: string]: any }, path: string): any {
    const assessment = this.getAssessment();
    
    // Map legacy paths to new paths
    let actualPath = path;
    if (path === 'hard_hat' || path === 'non_hard_hat') {
      actualPath = 'decided';
    } else if (path === 'unable_to_decide') {
      actualPath = 'undecided';
    }
    
    // Get the specific career category from work preference
    let workPreference = responses.work_preference_main;
    
    // For undecided students, determine their work preference based on exploration responses
    if (actualPath === 'undecided' && workPreference === 'unable_to_decide') {
      workPreference = this.determineWorkPreferenceFromExploration(responses);
      console.log('🔍 Determined work preference for undecided student:', workPreference);
    }
    
    if (actualPath === 'undecided' && (!workPreference || workPreference === 'unable_to_decide')) {
      // For truly undecided students, generate exploration matches
      return this.generateExplorationMatches(responses);
    }
    
    // Get careers for the determined category
    const categoryMapping = assessment.careerMapping[workPreference];
    if (!categoryMapping) {
      return this.generateExplorationMatches(responses);
    }

    // Filter by education level
    const educationLevel = responses.education_commitment;
    const filteredCareers = this.filterCareersByEducation(categoryMapping.careers, educationLevel);

    // Score careers based on subject strengths
    const scoredCareers = this.scoreCareersBySubjects(filteredCareers, responses.subject_strengths);

    return {
      primaryMatches: scoredCareers.slice(0, 3),
      secondaryMatches: scoredCareers.slice(3, 6),
      sectors: categoryMapping.primarySectors,
      determinedWorkPreference: workPreference, // Include the determined preference
      matchingLogic: {
        primaryFactor: `Selected/Determined career category: ${workPreference}`,
        educationFilter: `Education level: ${educationLevel}`,
        subjectAlignment: this.getSubjectAlignmentDescription(responses.subject_strengths),
        explorationBased: actualPath === 'undecided' ? 'Based on interests, traits, and experience analysis' : undefined
      }
    };
  }

  /**
   * Generate exploration matches for uncertain students
   */
  private static generateExplorationMatches(responses: { [key: string]: any }): any {
    // Return diverse career options across multiple categories
    const assessment = this.getAssessment();
    const allCareers: string[] = [];
    
    Object.values(assessment.careerMapping).forEach(mapping => {
      allCareers.push(...mapping.careers.slice(0, 2)); // Take top 2 from each category
    });

    return {
      primaryMatches: allCareers.slice(0, 6),
      secondaryMatches: allCareers.slice(6, 12),
      sectors: ['multiple'],
      matchingLogic: {
        primaryFactor: 'Exploration mode - showing diverse career options',
        educationFilter: `Education level: ${responses.education_commitment}`,
        note: 'Consider taking the assessment again after exploring these options'
      }
    };
  }

  /**
   * Filter careers by education requirements
   */
  private static filterCareersByEducation(careers: string[], educationLevel: string): string[] {
    // This would ideally use a career database with education requirements
    // For now, return all careers (would be enhanced with actual education mapping)
    return careers;
  }

  /**
   * Score careers based on subject strengths (1-5 rating system)
   */
  private static scoreCareersBySubjects(careers: string[], subjectStrengths: any): string[] {
    if (!subjectStrengths) return careers;

    // Enhanced subject-career mapping for better job matching
    const subjectCareerMapping = {
      'math': ['Data Analyst', 'Financial Analyst', 'Accountant', 'Statistician', 'Engineer', 'Actuary'],
      'science': ['Research Scientist', 'Laboratory Technician', 'Environmental Scientist', 'Biomedical Engineer', 'Medical Technologist', 'Nurse'],
      'english': ['Teacher', 'Writer', 'School Counselor', 'Corporate Trainer', 'Tutor'],
      'art': ['Graphic Designer', 'Photographer', 'Art Director', 'Musician', 'Interior Designer', 'Fashion Designer'],
      'technology': ['Software Developer', 'Web Developer', 'IT Specialist', 'Cybersecurity Analyst', 'Database Administrator'],
      'history': ['Teacher', 'Police Officer', 'School Counselor'],
      'physical_ed': ['Firefighter', 'EMT', 'Physical Therapist'],
      'languages': ['Teacher', 'Tutor', 'Corporate Trainer']
    };

    return careers.map(career => {
      let subjectScore = 0;
      let matchCount = 0;
      
      // Calculate weighted score based on 1-5 ratings
      Object.entries(subjectStrengths).forEach(([subject, rating]) => {
        const numericRating = parseInt(rating as string);
        if (numericRating >= 1 && numericRating <= 5) {
          const relevantCareers = subjectCareerMapping[subject as keyof typeof subjectCareerMapping] || [];
          const isRelevant = relevantCareers.some(careerTitle => 
            career.toLowerCase().includes(careerTitle.toLowerCase()) || 
            careerTitle.toLowerCase().includes(career.toLowerCase())
          );
          
          if (isRelevant) {
            // Weight: 5=25 points, 4=20 points, 3=10 points, 2=5 points, 1=0 points
            const scoreWeight = Math.max(0, (numericRating - 1) * 5);
            subjectScore += scoreWeight;
            matchCount++;
          }
        }
      });
      
      // Average the score if multiple subjects match
      const finalScore = matchCount > 0 ? subjectScore / matchCount : 0;
      
      return {
        career,
        subjectScore: finalScore
      };
    })
    .sort((a, b) => b.subjectScore - a.subjectScore) // Sort by highest subject alignment
    .map(item => item.career);
  }

  /**
   * Get subject alignment description (1-5 rating system)
   */
  private static getSubjectAlignmentDescription(subjectStrengths: any): string {
    if (!subjectStrengths) return 'No subject preferences specified';

    // Find subjects with high interest (4-5 rating)
    const highInterestSubjects = Object.entries(subjectStrengths)
      .filter(([_, rating]) => {
        const numericRating = parseInt(rating as string);
        return numericRating >= 4;
      })
      .map(([subject, rating]) => `${subject} (${rating}/5)`)
      .sort((a, b) => {
        const ratingA = parseInt(a.match(/\((\d)\/5\)/)?.[1] || '0');
        const ratingB = parseInt(b.match(/\((\d)\/5\)/)?.[1] || '0');
        return ratingB - ratingA;
      });

    if (highInterestSubjects.length > 0) {
      return `High interest in: ${highInterestSubjects.join(', ')}`;
    }

    // Find subjects with moderate interest (3 rating)
    const moderateInterestSubjects = Object.entries(subjectStrengths)
      .filter(([_, rating]) => {
        const numericRating = parseInt(rating as string);
        return numericRating === 3;
      })
      .map(([subject, _]) => subject);

    if (moderateInterestSubjects.length > 0) {
      return `Moderate interest in: ${moderateInterestSubjects.join(', ')}`;
    }

    return 'Subject interests to be explored further';
  }

  /**
   * Determine work preference for undecided students based on exploration responses
   * Uses only the 3 exploration questions: interests/hobbies, experience, and traits
   */
  private static determineWorkPreferenceFromExploration(responses: { [key: string]: any }): string {
    let hardHatScore = 0;
    let nonHardHatScore = 0;
    
    console.log('🔍 Analyzing undecided student responses for work preference determination...');
    
    // Question 2.2.1: Analyze interests/hobbies text
    const interests = (responses.undecided_interests_hobbies || '').toLowerCase();
    console.log('📝 Interests/hobbies:', interests.substring(0, 100) + '...');
    
    const hardHatInterestKeywords = [
      'build', 'fix', 'repair', 'construct', 'tools', 'hands-on', 'mechanical', 
      'woodworking', 'metalworking', 'automotive', 'electrical', 'plumbing',
      'crafts', 'making', 'creating things', 'workshop', 'garage', 'carpentry',
      'welding', 'machinery', 'engines', 'hardware', 'construction',
      'architecture', 'blueprints', 'building designs', 'structural', 'engineering'
    ];
    
    const nonHardHatInterestKeywords = [
      'computer', 'programming', 'coding', 'software', 'technology', 'data',
      'research', 'writing', 'reading', 'teaching', 'helping people', 'healthcare',
      'art', 'design', 'music', 'photography', 'business', 'finance', 'analysis',
      'communication', 'languages', 'science experiments', 'laboratory', 'studying',
      'tutoring', 'volunteering', 'community service', 'drawing', 'painting'
    ];
    
    let interestHardHatMatches = 0;
    let interestNonHardHatMatches = 0;
    
    hardHatInterestKeywords.forEach(keyword => {
      if (interests.includes(keyword)) {
        hardHatScore += 4;
        interestHardHatMatches++;
      }
    });
    
    nonHardHatInterestKeywords.forEach(keyword => {
      if (interests.includes(keyword)) {
        nonHardHatScore += 4;
        interestNonHardHatMatches++;
      }
    });
    
    // Question 2.2.2: Analyze work/volunteer experience text
    const experience = (responses.undecided_work_experience || '').toLowerCase();
    console.log('💼 Work/volunteer experience:', experience.substring(0, 100) + '...');
    
    const hardHatExperienceKeywords = [
      'construction', 'building', 'repair', 'maintenance', 'workshop', 'garage',
      'tools', 'mechanical', 'electrical', 'plumbing', 'carpentry', 'welding',
      'automotive', 'machinery', 'hardware store', 'landscaping', 'farming',
      'architect', 'engineering', 'design projects'
    ];
    
    const nonHardHatExperienceKeywords = [
      'office', 'computer', 'technology', 'tutoring', 'teaching', 'healthcare',
      'hospital', 'clinic', 'research', 'laboratory', 'library', 'customer service',
      'retail', 'restaurant', 'art', 'design', 'photography', 'writing', 'editing',
      'social media', 'marketing', 'business', 'finance', 'accounting'
    ];
    
    let experienceHardHatMatches = 0;
    let experienceNonHardHatMatches = 0;
    
    hardHatExperienceKeywords.forEach(keyword => {
      if (experience.includes(keyword)) {
        hardHatScore += 5; // Experience weighted higher than interests
        experienceHardHatMatches++;
      }
    });
    
    nonHardHatExperienceKeywords.forEach(keyword => {
      if (experience.includes(keyword)) {
        nonHardHatScore += 5;
        experienceNonHardHatMatches++;
      }
    });
    
    // Question 2.2.3: Analyze personal traits
    const personalTraits = responses.undecided_personal_traits || [];
    console.log('🎯 Personal traits:', personalTraits);
    
    const hardHatTraits = {
      'hands_on': 6,        // Strong indicator for hard hat work
      'problem_solver': 3,   // Useful for both but slightly more for hard hat
      'independent': 2,      // Trades often work independently
      'detail_oriented': 2   // Important for precision work
    };
    
    const nonHardHatTraits = {
      'analytical': 5,       // Strong indicator for data/research work
      'creative': 4,         // Arts, design, creative fields
      'helpful': 4,          // Healthcare, education, service
      'leader': 3,           // Management, education roles
      'communicator': 5,     // Education, business, service roles
      'team_player': 3       // Office environments, collaborative work
    };
    
    let traitHardHatMatches = 0;
    let traitNonHardHatMatches = 0;
    
    personalTraits.forEach((trait: string) => {
      const hardHatWeight = hardHatTraits[trait as keyof typeof hardHatTraits];
      const nonHardHatWeight = nonHardHatTraits[trait as keyof typeof nonHardHatTraits];
      
      if (hardHatWeight) {
        hardHatScore += hardHatWeight;
        traitHardHatMatches++;
      }
      if (nonHardHatWeight) {
        nonHardHatScore += nonHardHatWeight;
        traitNonHardHatMatches++;
      }
    });
    
    console.log('📊 Analysis Results:');
    console.log(`   Hard Hat Score: ${hardHatScore} (Interests: ${interestHardHatMatches}, Experience: ${experienceHardHatMatches}, Traits: ${traitHardHatMatches})`);
    console.log(`   Non Hard Hat Score: ${nonHardHatScore} (Interests: ${interestNonHardHatMatches}, Experience: ${experienceNonHardHatMatches}, Traits: ${traitNonHardHatMatches})`);
    
    // Determine the specific category based on highest scoring area
    if (hardHatScore > nonHardHatScore) {
      console.log('🔨 Determined: Hard Hat work preference');
      
      // Determine specific hard hat category
      if (personalTraits.includes('creative') || 
          interests.includes('design') || 
          interests.includes('architecture') ||
          interests.includes('drawing') ||
          experience.includes('design')) {
        console.log('🏗️ Specific category: Creating Designs (Architecture/Engineering)');
        return 'hard_hat_creating_designs';
      } else {
        console.log('🔧 Specific category: Building/Fixing with Tools');
        return 'hard_hat_building_fixing';
      }
    } else if (nonHardHatScore > hardHatScore) {
      console.log('💼 Determined: Non Hard Hat work preference');
      
      // Determine specific non hard hat category based on strongest indicators
      const categoryScores = {
        'non_hard_hat_technology': 0,
        'non_hard_hat_healthcare': 0,
        'non_hard_hat_education': 0,
        'non_hard_hat_data_analysis': 0,
        'non_hard_hat_creative': 0,
        'non_hard_hat_research': 0,
        'non_hard_hat_rescue': 0
      };
      
      // Score each category based on specific indicators
      
      // Technology category
      if (personalTraits.includes('analytical') || 
          interests.includes('computer') || 
          interests.includes('technology') ||
          interests.includes('programming') ||
          experience.includes('technology')) {
        categoryScores.non_hard_hat_technology += 6;
      }
      
      // Healthcare category
      if (personalTraits.includes('helpful') || 
          interests.includes('healthcare') || 
          interests.includes('helping people') ||
          interests.includes('medical') ||
          experience.includes('hospital') ||
          experience.includes('healthcare')) {
        categoryScores.non_hard_hat_healthcare += 6;
      }
      
      // Education category
      if (personalTraits.includes('communicator') || 
          interests.includes('teaching') || 
          interests.includes('education') ||
          interests.includes('tutoring') ||
          experience.includes('tutoring') ||
          experience.includes('teaching')) {
        categoryScores.non_hard_hat_education += 6;
      }
      
      // Data analysis category
      if (personalTraits.includes('analytical') || 
          interests.includes('data') || 
          interests.includes('numbers') ||
          interests.includes('math') ||
          interests.includes('statistics')) {
        categoryScores.non_hard_hat_data_analysis += 5;
      }
      
      // Creative category
      if (personalTraits.includes('creative') || 
          interests.includes('art') || 
          interests.includes('design') ||
          interests.includes('music') ||
          interests.includes('photography') ||
          experience.includes('art') ||
          experience.includes('design')) {
        categoryScores.non_hard_hat_creative += 6;
      }
      
      // Research category
      if (interests.includes('research') || 
          interests.includes('science') || 
          interests.includes('discover') ||
          interests.includes('experiments') ||
          experience.includes('research') ||
          experience.includes('laboratory')) {
        categoryScores.non_hard_hat_research += 5;
      }
      
      // Rescue/Public Safety category
      if (interests.includes('help') || 
          interests.includes('rescue') || 
          interests.includes('emergency') ||
          interests.includes('safety') ||
          experience.includes('emergency') ||
          experience.includes('safety')) {
        categoryScores.non_hard_hat_rescue += 5;
      }
      
      // Return the highest scoring category
      const topCategory = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)[0];
      
      console.log('🎯 Category scores:', categoryScores);
      console.log(`✅ Selected category: ${topCategory[0]} (score: ${topCategory[1]})`);
      
      return topCategory[0];
    } else {
      // Scores are equal or both low - default based on any strong indicators
      console.log('⚖️ Scores are equal, using fallback logic');
      
      if (personalTraits.includes('hands_on') || interests.includes('build') || interests.includes('fix')) {
        console.log('🔧 Fallback: Hard Hat (hands-on indicators found)');
        return 'hard_hat_building_fixing';
      } else {
        console.log('💻 Fallback: Technology (broad non-hard hat category)');
        return 'non_hard_hat_technology';
      }
    }
  }
}

// Export alias for backward compatibility
export const ImprovedAssessmentService = FinalAssessmentService;