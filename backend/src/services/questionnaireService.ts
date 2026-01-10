import questionnaireData from '../data/questionnaire-v1.json';
import { StudentProfile } from '../types/recommendation';

export interface QuestionnaireSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multi_select' | 'text' | 'text_area' | 'matrix';
  required: boolean;
  options?: string[];
  subjects?: string[];
  validation?: {
    pattern: string;
    message: string;
  };
  placeholder?: string;
}

export interface QuestionnaireResponse {
  [key: string]: any;
}

export class QuestionnaireService {
  /**
   * Get the complete questionnaire structure
   */
  static getQuestionnaire(): {
    version: string;
    title: string;
    description: string;
    sections: QuestionnaireSection[];
  } {
    return questionnaireData as any;
  }

  /**
   * Get a specific section of the questionnaire
   */
  static getSection(sectionId: string): QuestionnaireSection | null {
    const section = (questionnaireData as any).sections.find((s: any) => s.id === sectionId);
    return section || null;
  }

  /**
   * Validate questionnaire responses
   */
  static validateResponses(responses: QuestionnaireResponse): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    const questionnaire = this.getQuestionnaire();
    
    for (const section of questionnaire.sections) {
      for (const question of section.questions) {
        if (question.required && !responses[question.id]) {
          errors.push(`${question.text} is required`);
        }

        // Validate specific field formats
        if (question.id === 'zipCode' && responses[question.id]) {
          const zipCode = responses[question.id];
          if (!/^\d{5}$/.test(zipCode)) {
            errors.push('ZIP code must be exactly 5 digits');
          }
        }

        // Validate multi-select arrays
        if (question.type === 'multi_select' && responses[question.id]) {
          if (!Array.isArray(responses[question.id])) {
            errors.push(`${question.text} must be an array of selections`);
          }
        }

        // Validate matrix responses
        if (question.type === 'matrix' && responses[question.id]) {
          const matrixResponse = responses[question.id];
          if (typeof matrixResponse !== 'object') {
            errors.push(`${question.text} must be an object with subject ratings`);
          }
        }
      }
    }

    // Add warnings for incomplete optional sections
    if (!responses.interests || responses.interests.trim().length < 10) {
      warnings.push('Consider adding more detail about your interests and hobbies');
    }

    if (!responses.experience || responses.experience.trim().length < 10) {
      warnings.push('Consider describing any work, volunteer, or activity experience you have');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Convert questionnaire responses to StudentProfile format
   */
  static convertToStudentProfile(responses: QuestionnaireResponse): StudentProfile {
    // Ensure arrays exist for multi-select fields
    const workEnvironment = Array.isArray(responses.workEnvironment) ? responses.workEnvironment : [];
    const workStyle = Array.isArray(responses.workStyle) ? responses.workStyle : [];
    const thinkingStyle = Array.isArray(responses.thinkingStyle) ? responses.thinkingStyle : [];
    const academicInterests = Array.isArray(responses.academicInterests) ? responses.academicInterests : [];
    const traits = Array.isArray(responses.traits) ? responses.traits : [];
    const constraints = Array.isArray(responses.constraints) ? responses.constraints : [];

    // Convert grade to number
    const gradeMap: { [key: string]: number } = {
      '9th': 9,
      '10th': 10,
      '11th': 11,
      '12th': 12
    };
    const grade = gradeMap[responses.grade] || 9;

    // Ensure academic performance is an object
    const academicPerformance = typeof responses.academicPerformance === 'object' 
      ? responses.academicPerformance 
      : {};

    const profile: StudentProfile = {
      // Basic Information
      grade,
      zipCode: responses.zipCode || '',

      // Work Environment Preferences
      workEnvironment,

      // Work Style
      workStyle,

      // Thinking Style
      thinkingStyle,

      // Education & Training
      educationWillingness: responses.educationWillingness || "I'm not sure yet",

      // Academic Interests
      academicInterests,

      // Academic Performance
      academicPerformance,

      // Interests & Experience
      interests: responses.interests || '',
      experience: responses.experience || 'None yet',

      // Personality & Traits
      traits,
      otherTraits: responses.otherTraits,

      // Values
      incomeImportance: responses.incomeImportance || 'Not sure',
      stabilityImportance: responses.stabilityImportance || 'Not sure',
      helpingImportance: responses.helpingImportance || 'Not sure',

      // Lifestyle & Constraints
      constraints,

      // Decision Readiness & Risk
      decisionPressure: responses.decisionPressure || 'Just exploring options',
      riskTolerance: responses.riskTolerance || 'Not sure',

      // Support & Confidence
      supportLevel: responses.supportLevel || 'Not sure about support',
      careerConfidence: responses.careerConfidence || 'Unsure',

      // Reflection
      impactStatement: responses.impactStatement,
      inspiration: responses.inspiration
    };

    return profile;
  }

  /**
   * Get questionnaire progress
   */
  static getProgress(responses: QuestionnaireResponse): {
    completedSections: number;
    totalSections: number;
    completedQuestions: number;
    totalQuestions: number;
    percentComplete: number;
  } {
    const questionnaire = this.getQuestionnaire();
    let completedSections = 0;
    let completedQuestions = 0;
    let totalQuestions = 0;

    for (const section of questionnaire.sections) {
      let sectionComplete = true;
      let sectionHasRequiredQuestions = false;
      
      for (const question of section.questions) {
        totalQuestions++;
        
        if (responses[question.id] && responses[question.id] !== '') {
          completedQuestions++;
        } else if (question.required) {
          sectionComplete = false;
        }
        
        if (question.required) {
          sectionHasRequiredQuestions = true;
        }
      }
      
      // Only count section as complete if it has required questions and they're all answered
      if (sectionComplete && sectionHasRequiredQuestions) {
        completedSections++;
      }
    }

    const percentComplete = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

    return {
      completedSections,
      totalSections: questionnaire.sections.length,
      completedQuestions,
      totalQuestions,
      percentComplete
    };
  }

  /**
   * Get next incomplete section
   */
  static getNextSection(responses: QuestionnaireResponse): QuestionnaireSection | null {
    const questionnaire = this.getQuestionnaire();
    
    for (const section of questionnaire.sections) {
      for (const question of section.questions) {
        if (question.required && (!responses[question.id] || responses[question.id] === '')) {
          return section;
        }
      }
    }
    
    return null; // All required sections complete
  }

  /**
   * Generate a summary of responses for review
   */
  static generateSummary(responses: QuestionnaireResponse): {
    basicInfo: any;
    preferences: any;
    academics: any;
    personality: any;
    goals: any;
  } {
    return {
      basicInfo: {
        grade: responses.grade,
        zipCode: responses.zipCode
      },
      preferences: {
        workEnvironment: responses.workEnvironment,
        workStyle: responses.workStyle,
        thinkingStyle: responses.thinkingStyle,
        constraints: responses.constraints
      },
      academics: {
        interests: responses.academicInterests,
        performance: responses.academicPerformance,
        educationWillingness: responses.educationWillingness
      },
      personality: {
        traits: responses.traits,
        otherTraits: responses.otherTraits,
        riskTolerance: responses.riskTolerance,
        careerConfidence: responses.careerConfidence
      },
      goals: {
        incomeImportance: responses.incomeImportance,
        stabilityImportance: responses.stabilityImportance,
        helpingImportance: responses.helpingImportance,
        impactStatement: responses.impactStatement,
        inspiration: responses.inspiration
      }
    };
  }
}