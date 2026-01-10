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
  pathTaken: 'hard_hat' | 'non_hard_hat' | 'unable_to_decide';
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
    const pathConfig = assessment.pathLogic[path];
    
    if (!pathConfig) {
      throw new Error(`Invalid path: ${path}`);
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
    return assessment.questions.find(q => q.branchingQuestion) || null;
  }

  /**
   * Determine path based on work preference response
   */
  static determinePath(workPreferenceResponse: string): string {
    // In v3, the work preference directly maps to the path
    switch (workPreferenceResponse) {
      case 'hard_hat':
        return 'hard_hat';
      case 'non_hard_hat':
        return 'non_hard_hat';
      case 'unable_to_decide':
        return 'unable_to_decide';
      default:
        return 'unable_to_decide'; // Default to exploration path
    }
  }

  /**
   * Get universal questions (apply to all paths)
   */
  static getUniversalQuestions(): ImprovedQuestion[] {
    const assessment = this.getAssessment();
    return assessment.questions.filter(q => 
      !q.appliesTo || (q.appliesTo.includes('hard_hat') && q.appliesTo.includes('non_hard_hat') && q.appliesTo.includes('unable_to_decide'))
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
    const questions = this.getQuestionsForPath(path);

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
            // Check if at least some subjects are rated
            const ratedSubjects = Object.values(response).filter(rating => 
              rating && rating !== 'not_taken'
            );
            if (ratedSubjects.length === 0) {
              warnings.push('Consider rating at least a few subjects to get better career matches');
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
    if (path === 'hard_hat' && !responses.hard_hat_specific) {
      warnings.push('Since you chose hard hat work, selecting a specific area will help us give better guidance');
    }

    if (path === 'non_hard_hat' && !responses.non_hard_hat_specific) {
      warnings.push('Since you chose non hard hat work, selecting a specific area will help us give better guidance');
    }

    if (path === 'unable_to_decide' && (!responses.personal_traits || !responses.interests_hobbies)) {
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
    const weightedData = {
      assessmentVersion: 'v3',
      pathTaken: path,
      responses,
      primaryIndicators: this.extractPrimaryIndicators(responses, path),
      secondaryIndicators: this.extractSecondaryIndicators(responses, path),
      constraints: this.extractConstraints(responses)
    };

    return weightedData;
  }

  /**
   * Extract primary indicators (highest weight factors)
   */
  private static extractPrimaryIndicators(responses: { [key: string]: any }, path: string): any {
    const indicators: any = {};

    // Work preference selection (Weight: 40)
    if (responses.work_preference_main) {
      indicators.workPreference = {
        value: responses.work_preference_main,
        weight: 40,
        description: this.getWorkPreferenceDescription(responses.work_preference_main)
      };
    }

    // Specific specialization choice (Weight: 35)
    if (path === 'hard_hat' && responses.hard_hat_specific) {
      indicators.hardHatSpecialization = {
        value: responses.hard_hat_specific,
        weight: 35,
        description: 'Student\'s specific hard hat career direction'
      };
    } else if (path === 'non_hard_hat' && responses.non_hard_hat_specific) {
      indicators.nonHardHatSpecialization = {
        value: responses.non_hard_hat_specific,
        weight: 35,
        description: 'Student\'s specific professional career direction'
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

    // Subject strengths (Weight: 25)
    if (responses.subject_strengths) {
      const excellentSubjects = Object.entries(responses.subject_strengths)
        .filter(([_, rating]) => rating === 'excellent')
        .map(([subject, _]) => subject);
      
      const goodSubjects = Object.entries(responses.subject_strengths)
        .filter(([_, rating]) => rating === 'good')
        .map(([subject, _]) => subject);

      indicators.subjectStrengths = {
        excellent: excellentSubjects,
        good: goodSubjects,
        weight: 25,
        description: 'Subjects where student excels or performs well'
      };
    }

    return indicators;
  }

  /**
   * Extract constraint factors
   */
  private static extractConstraints(responses: { [key: string]: any }): any {
    const constraints: any = {};

    if (responses.career_constraints && responses.career_constraints.trim()) {
      constraints.personalConstraints = {
        value: responses.career_constraints,
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
    const workQuestion = assessment.questions.find(q => q.id === 'work_preference_main');
    const option = workQuestion?.options?.find(opt => opt.value === preference);
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
    const questions = this.getQuestionsForPath(path);
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
    
    // Get the specific career category based on path
    let careerCategory: string | undefined;
    
    if (path === 'hard_hat') {
      careerCategory = responses.hard_hat_specific;
    } else if (path === 'non_hard_hat') {
      careerCategory = responses.non_hard_hat_specific;
    } else {
      // For unable_to_decide, we'll generate exploration matches
      return this.generateExplorationMatches(responses);
    }
    
    if (!careerCategory) {
      return this.generateExplorationMatches(responses);
    }

    // Get careers for the selected category
    const categoryMapping = assessment.careerMapping[careerCategory];
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
      matchingLogic: {
        primaryFactor: `Selected career category: ${careerCategory}`,
        educationFilter: `Education level: ${educationLevel}`,
        subjectAlignment: this.getSubjectAlignmentDescription(responses.subject_strengths)
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
   * Score careers based on subject strengths
   */
  private static scoreCareersBySubjects(careers: string[], subjectStrengths: any): string[] {
    if (!subjectStrengths) return careers;

    // Simple scoring based on subject alignment
    // This would be enhanced with actual career-subject mapping
    return careers.sort((a, b) => {
      // Prioritize careers that align with excellent subjects
      // This is a simplified version - would use actual career-subject database
      return Math.random() - 0.5; // Placeholder random sort
    });
  }

  /**
   * Get subject alignment description
   */
  private static getSubjectAlignmentDescription(subjectStrengths: any): string {
    if (!subjectStrengths) return 'No subject preferences specified';

    const excellentSubjects = Object.entries(subjectStrengths)
      .filter(([_, rating]) => rating === 'excellent')
      .map(([subject, _]) => subject);

    if (excellentSubjects.length > 0) {
      return `Strong in: ${excellentSubjects.join(', ')}`;
    }

    const goodSubjects = Object.entries(subjectStrengths)
      .filter(([_, rating]) => rating === 'good')
      .map(([subject, _]) => subject);

    if (goodSubjects.length > 0) {
      return `Good at: ${goodSubjects.join(', ')}`;
    }

    return 'Subject strengths to be determined';
  }
}

// Export alias for backward compatibility
export const ImprovedAssessmentService = FinalAssessmentService;