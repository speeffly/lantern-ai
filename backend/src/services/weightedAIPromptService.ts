import { ImprovedAssessmentResponse } from './improvedCareerMatchingService';

export interface QuestionWeight {
  questionId: string;
  weight: number;
  priority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'CONSTRAINT';
  appliesTo: string[];
  isHardConstraint?: boolean;
  llmInstruction: string;
}

export class WeightedAIPromptService {
  
  private static readonly QUESTION_WEIGHTS: QuestionWeight[] = [
    {
      questionId: 'career_category',
      weight: 50,
      priority: 'PRIMARY',
      appliesTo: ['pathA', 'pathB'],
      llmInstruction: 'This is the MOST IMPORTANT factor (50% weight). If student selects "healthcare", 80% of recommendations must be healthcare careers. This overrides personality traits, hobbies, or other preferences.'
    },
    {
      questionId: 'specific_career_interest',
      weight: 45,
      priority: 'PRIMARY',
      appliesTo: ['pathA'],
      llmInstruction: 'This is the student\'s explicit career direction (45% weight). If they mention "nursing", prioritize nursing and closely related healthcare careers. Validate this choice and build detailed pathways around it.'
    },
    {
      questionId: 'education_commitment',
      weight: 30,
      priority: 'SECONDARY',
      appliesTo: ['pathA', 'pathB'],
      isHardConstraint: true,
      llmInstruction: 'This is a HARD CONSTRAINT (30% weight). Never suggest careers requiring more education than the student is willing to pursue. Filter all careers by this requirement first.'
    },
    {
      questionId: 'subject_strengths',
      weight: 25,
      priority: 'SECONDARY',
      appliesTo: ['pathA', 'pathB'],
      llmInstruction: 'Focus on subjects rated "excellent" (25 points) or "good" (15 points). These indicate natural aptitude. Use to identify specific roles within the career category, not to override category selection.'
    },
    {
      questionId: 'personal_traits',
      weight: 15,
      priority: 'TERTIARY',
      appliesTo: ['pathB'],
      llmInstruction: 'Use traits to differentiate between careers within the same category (15% weight). If student selected "healthcare" and is "analytical", suggest medical technologist over nurse aide. Don\'t let traits override category.'
    },
    {
      questionId: 'impact_legacy',
      weight: 12,
      priority: 'TERTIARY',
      appliesTo: ['pathB'],
      llmInstruction: 'Use this to enhance explanations and validate career fit (12% weight). If they want to "save lives" and selected healthcare, emphasize emergency medicine. Use for WHY explanations, not career selection.'
    },
    {
      questionId: 'inspiration',
      weight: 10,
      priority: 'TERTIARY',
      appliesTo: ['pathB'],
      llmInstruction: 'Use inspirational figures to validate career choices and provide role models (10% weight). If they admire a teacher and selected education, reinforce teaching careers with specific examples.'
    },
    {
      questionId: 'constraints_considerations',
      weight: 999, // Override weight
      priority: 'CONSTRAINT',
      appliesTo: ['pathA', 'pathB'],
      isHardConstraint: true,
      llmInstruction: 'These are OVERRIDE constraints. Physical limitations, financial constraints, or location restrictions can eliminate otherwise perfect matches. Always check constraints before finalizing recommendations.'
    }
  ];

  /**
   * Generate weighted AI prompt that clearly communicates question importance
   */
  static generateWeightedPrompt(responses: ImprovedAssessmentResponse): string {
    const applicableWeights = this.QUESTION_WEIGHTS
      .filter(w => w.appliesTo.includes(responses.pathTaken))
      .sort((a, b) => b.weight - a.weight);

    const prompt = `You are an expert career counselor analyzing a ${responses.pathTaken === 'pathA' ? 'CLEAR DIRECTION' : 'UNCERTAIN'} student's assessment responses.

CRITICAL: Use this WEIGHTED IMPORTANCE HIERARCHY when making recommendations:

${this.generateWeightedAnalysis(responses, applicableWeights)}

MATCHING ALGORITHM INSTRUCTIONS:
1. PRIMARY FILTER (50-45% weight): Start with career category as the dominant factor
2. CONSTRAINT FILTER (30% weight): Apply education and physical constraints as hard limits
3. APTITUDE REFINEMENT (25% weight): Use subject strengths to identify specific roles
4. PERSONALITY REFINEMENT (15-10% weight): Use traits/values for differentiation within category
5. CONSTRAINT OVERRIDE: Apply any physical/personal limitations as final filter

EXPLANATION REQUIREMENTS:
Structure explanations using the weighted hierarchy:
"This [CAREER] matches because:
- PRIMARY (50%): You selected '[CATEGORY]' as your preferred work type
- SECONDARY (30%): Requires [EDUCATION] which matches your commitment level  
- SUPPORTING (25%): Your excellent rating in [SUBJECT] aligns with career requirements
- PERSONAL (15%): Your [TRAIT] personality fits well with [CAREER] demands"

${this.generatePathSpecificInstructions(responses)}

CRITICAL SUCCESS FACTORS:
- 80% of recommendations must align with the primary career category
- Never suggest careers requiring more education than student committed to
- Use subject strengths to identify specific roles, not change categories
- Personality traits refine choices within category, don't override category
- Always check constraints before finalizing any recommendation

Generate career recommendations following this weighted approach.`;

    return prompt;
  }

  /**
   * Generate weighted analysis section of the prompt
   */
  private static generateWeightedAnalysis(
    responses: ImprovedAssessmentResponse, 
    weights: QuestionWeight[]
  ): string {
    let analysis = '';
    
    weights.forEach((weight, index) => {
      const responseValue = responses.responses[weight.questionId as keyof typeof responses.responses];
      
      if (responseValue !== undefined && responseValue !== null && responseValue !== '') {
        const priorityIcon = {
          'PRIMARY': '🎯',
          'SECONDARY': '📚', 
          'TERTIARY': '🧠',
          'CONSTRAINT': '⚠️'
        }[weight.priority];

        analysis += `${priorityIcon} ${index + 1}. ${weight.questionId.toUpperCase()} (${weight.priority} - Weight: ${weight.weight}${weight.isHardConstraint ? ' - HARD CONSTRAINT' : ''})\n`;
        analysis += `   Student Response: "${this.formatResponse(responseValue)}"\n`;
        analysis += `   LLM Instruction: ${weight.llmInstruction}\n\n`;
      }
    });

    return analysis;
  }

  /**
   * Generate path-specific instructions
   */
  private static generatePathSpecificInstructions(responses: ImprovedAssessmentResponse): string {
    if (responses.pathTaken === 'pathA') {
      return `
PATH A (CLEAR DIRECTION) SPECIFIC INSTRUCTIONS:
- This student has a clear career direction - VALIDATE their choice
- Focus on pathway planning, skill gaps, and specific next steps
- If their specific interest aligns with category selection, provide detailed career pathway
- If there's a mismatch, gently explore related careers within their preferred category
- Provide 3-5 highly relevant career suggestions rather than broad exploration`;
    } else {
      return `
PATH B (EXPLORATION) SPECIFIC INSTRUCTIONS:
- This student is exploring options - BROADEN their perspective within their preferred category
- Use personality traits and values to suggest diverse roles within the category
- Provide 5-8 career options to explore, all within their selected category
- Emphasize discovery and learning about different possibilities
- Connect career suggestions to their inspirations and desired impact`;
    }
  }

  /**
   * Format response values for display in prompt
   */
  private static formatResponse(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      // Handle subject strengths matrix
      if (value && typeof value === 'object') {
        const entries = Object.entries(value)
          .filter(([_, rating]) => rating === 'excellent' || rating === 'good')
          .map(([subject, rating]) => `${subject}: ${rating}`);
        return entries.length > 0 ? entries.join(', ') : 'No strong subjects identified';
      }
    }
    
    return String(value);
  }

  /**
   * Calculate weighted score for a career match
   */
  static calculateWeightedScore(
    career: any, 
    responses: ImprovedAssessmentResponse
  ): { score: number; breakdown: any } {
    const applicableWeights = this.QUESTION_WEIGHTS
      .filter(w => w.appliesTo.includes(responses.pathTaken));
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    const breakdown: any = {};

    applicableWeights.forEach(weight => {
      if (weight.questionId === 'constraints_considerations') return; // Handle separately
      
      maxPossibleScore += weight.weight;
      const responseValue = responses.responses[weight.questionId as keyof typeof responses.responses];
      const questionScore = this.calculateQuestionScore(career, weight.questionId, responseValue);
      const weightedScore = questionScore * (weight.weight / 100);
      
      totalScore += weightedScore;
      breakdown[weight.questionId] = {
        rawScore: questionScore,
        weight: weight.weight,
        weightedScore: weightedScore,
        priority: weight.priority
      };
    });

    // Apply constraint penalties
    const constraintPenalty = this.calculateConstraintPenalty(career, responses);
    totalScore = Math.max(0, totalScore - constraintPenalty);
    
    if (constraintPenalty > 0) {
      breakdown.constraints = {
        penalty: constraintPenalty,
        reason: 'Physical/personal constraints applied'
      };
    }

    // Normalize to 0-100 scale
    const normalizedScore = Math.round((totalScore / (maxPossibleScore / 100)) * 100);
    
    return {
      score: Math.min(100, Math.max(0, normalizedScore)),
      breakdown
    };
  }

  /**
   * Calculate score for individual question response
   */
  private static calculateQuestionScore(career: any, questionId: string, responseValue: any): number {
    switch (questionId) {
      case 'career_category':
        return this.scoreCareerCategory(career, responseValue);
      
      case 'specific_career_interest':
        return this.scoreSpecificInterest(career, responseValue);
      
      case 'education_commitment':
        return this.scoreEducationMatch(career, responseValue);
      
      case 'subject_strengths':
        return this.scoreSubjectAlignment(career, responseValue);
      
      case 'personal_traits':
        return this.scorePersonalityMatch(career, responseValue);
      
      case 'impact_legacy':
        return this.scoreImpactAlignment(career, responseValue);
      
      case 'inspiration':
        return this.scoreInspirationMatch(career, responseValue);
      
      default:
        return 50; // Neutral score
    }
  }

  /**
   * Score career category match (most important)
   */
  private static scoreCareerCategory(career: any, category: string): number {
    const categoryMapping: { [key: string]: string[] } = {
      'healthcare': ['healthcare'],
      'technology': ['technology'],
      'education_coaching': ['education'],
      'hard_hat_building': ['infrastructure', 'manufacturing'],
      'hard_hat_design': ['infrastructure', 'creative'],
      'data_analysis': ['business', 'finance', 'science'],
      'public_safety': ['public-service'],
      'research_innovation': ['science', 'technology'],
      'creative_arts': ['creative']
    };

    const expectedSectors = categoryMapping[category] || [];
    return expectedSectors.includes(career.sector) ? 100 : 0;
  }

  /**
   * Score specific career interest match
   */
  private static scoreSpecificInterest(career: any, interest: string): number {
    if (!interest || typeof interest !== 'string') return 50;
    
    const interestLower = interest.toLowerCase();
    const careerTitleLower = career.title.toLowerCase();
    
    // Exact match
    if (careerTitleLower.includes(interestLower) || interestLower.includes(careerTitleLower)) {
      return 100;
    }
    
    // Keyword matching
    const keywords = interestLower.split(' ').filter(word => word.length > 3);
    const matchingKeywords = keywords.filter(keyword => 
      careerTitleLower.includes(keyword) || career.description?.toLowerCase().includes(keyword)
    );
    
    return Math.min(100, 50 + (matchingKeywords.length * 15));
  }

  /**
   * Score education requirement match
   */
  private static scoreEducationMatch(career: any, commitment: string): number {
    const educationHierarchy = {
      'certificate': 1,
      'associate': 2,
      'bachelor': 3,
      'advanced': 4
    };

    const studentLevel = educationHierarchy[commitment as keyof typeof educationHierarchy] || 1;
    const careerRequirement = career.requiredEducation?.toLowerCase() || '';
    
    let careerLevel = 1;
    if (careerRequirement.includes('bachelor')) careerLevel = 3;
    else if (careerRequirement.includes('associate')) careerLevel = 2;
    else if (careerRequirement.includes('master') || careerRequirement.includes('doctorate')) careerLevel = 4;
    
    // Perfect match or student willing to do more
    if (studentLevel >= careerLevel) return 100;
    
    // Student not willing to meet requirements
    return 0;
  }

  /**
   * Score subject strength alignment
   */
  private static scoreSubjectAlignment(career: any, subjects: any): number {
    if (!subjects || typeof subjects !== 'object') return 50;
    
    const subjectCareerMapping: { [key: string]: string[] } = {
      'math': ['Data Analyst', 'Financial Analyst', 'Accountant', 'Aerospace Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Structural Engineer'],
      'science': ['Nurse', 'Medical', 'Research', 'Laboratory', 'Environmental', 'Aerospace Engineer', 'Mechanical Engineer', 'Electrical Engineer'],
      'english': ['Teacher', 'Writer', 'Counselor', 'Trainer'],
      'art': ['Designer', 'Photographer', 'Artist'],
      'technology': ['Developer', 'IT', 'Cybersecurity', 'Electrical Engineer'],
      'history': ['Teacher', 'Police', 'Counselor'],
      'physical_ed': ['Firefighter', 'EMT', 'Therapist']
    };

    let totalScore = 0;
    let relevantSubjects = 0;

    Object.entries(subjects).forEach(([subject, rating]) => {
      const relevantCareers = subjectCareerMapping[subject] || [];
      const isRelevant = relevantCareers.some(careerKeyword => 
        career.title.toLowerCase().includes(careerKeyword.toLowerCase())
      );

      if (isRelevant) {
        relevantSubjects++;
        const ratingScore = {
          'excellent': 100,
          'good': 75,
          'average': 50,
          'struggling': 25,
          'not_taken': 40
        }[rating as string] || 50;
        
        totalScore += ratingScore;
      }
    });

    return relevantSubjects > 0 ? Math.round(totalScore / relevantSubjects) : 50;
  }

  /**
   * Score personality trait match
   */
  private static scorePersonalityMatch(career: any, traits: string[]): number {
    if (!Array.isArray(traits)) return 50;
    
    const traitCareerMapping: { [key: string]: string[] } = {
      'analytical': ['Analyst', 'Research', 'Financial'],
      'creative': ['Designer', 'Photographer', 'Artist', 'Writer'],
      'helpful': ['Nurse', 'Teacher', 'Counselor', 'Medical'],
      'leader': ['Teacher', 'Police', 'Firefighter', 'Manager'],
      'detail_oriented': ['Accountant', 'Laboratory', 'Database'],
      'problem_solver': ['Developer', 'Engineer', 'IT'],
      'hands_on': ['Electrician', 'Plumber', 'Construction']
    };

    let matchingTraits = 0;
    traits.forEach(trait => {
      const relevantCareers = traitCareerMapping[trait] || [];
      if (relevantCareers.some(keyword => career.title.toLowerCase().includes(keyword.toLowerCase()))) {
        matchingTraits++;
      }
    });

    return Math.min(100, 50 + (matchingTraits * 15));
  }

  /**
   * Score impact/legacy alignment
   */
  private static scoreImpactAlignment(career: any, impact: string): number {
    if (!impact || typeof impact !== 'string') return 50;
    
    const impactKeywords = {
      'help': ['Teacher', 'Counselor', 'Medical', 'Nurse'],
      'save': ['Firefighter', 'EMT', 'Police', 'Medical'],
      'teach': ['Teacher', 'Trainer', 'Tutor'],
      'heal': ['Nurse', 'Therapist', 'Medical'],
      'build': ['Construction', 'Architect', 'Engineer'],
      'create': ['Designer', 'Photographer', 'Developer'],
      'protect': ['Police', 'Firefighter', 'Security']
    };

    const impactLower = impact.toLowerCase();
    let matchScore = 50;

    Object.entries(impactKeywords).forEach(([keyword, careers]) => {
      if (impactLower.includes(keyword)) {
        if (careers.some(careerKeyword => 
          career.title.toLowerCase().includes(careerKeyword.toLowerCase())
        )) {
          matchScore += 10;
        }
      }
    });

    return Math.min(100, matchScore);
  }

  /**
   * Score inspiration match
   */
  private static scoreInspirationMatch(career: any, inspiration: string): number {
    if (!inspiration || typeof inspiration !== 'string') return 50;
    
    // Simple keyword matching for inspiration
    const inspirationLower = inspiration.toLowerCase();
    const careerTitleLower = career.title.toLowerCase();
    
    // Look for career-related keywords in inspiration
    const careerKeywords = careerTitleLower.split(' ');
    const matchingKeywords = careerKeywords.filter((keyword: string) => 
      keyword.length > 3 && inspirationLower.includes(keyword)
    );

    return matchingKeywords.length > 0 ? 75 : 50;
  }

  /**
   * Calculate constraint penalties
   */
  private static calculateConstraintPenalty(career: any, responses: ImprovedAssessmentResponse): number {
    const constraints = responses.responses.constraints_considerations;
    if (!constraints || typeof constraints !== 'string') return 0;
    
    const constraintsLower = constraints.toLowerCase();
    let penalty = 0;

    // Physical constraints
    if (constraintsLower.includes('back') || constraintsLower.includes('physical')) {
      if (career.category === 'hard_hat_building') penalty += 50;
    }

    // Location constraints
    if (constraintsLower.includes('travel') || constraintsLower.includes('location')) {
      if (career.title.toLowerCase().includes('travel')) penalty += 30;
    }

    // Financial constraints
    if (constraintsLower.includes('cost') || constraintsLower.includes('expensive')) {
      if (career.requiredEducation?.includes('Bachelor') || career.requiredEducation?.includes('Master')) {
        penalty += 25;
      }
    }

    return penalty;
  }
}