import questionnaireData from '../data/questionnaire-v1.json';
import { StudentProfile } from '../types/recommendation';

export interface Question {
  id: string;
  type: 'single_select' | 'multi_select' | 'text' | 'text_long' | 'matrix';
  label: string;
  options?: string[] | Array<{ key: string; label: string }>;
  rows?: string[];
  columns?: string[];
  required: boolean;
}

export interface Questionnaire {
  version: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface QuestionnaireResponse {
  [key: string]: any;
}

export class QuestionnaireService {
  /**
   * Get the complete questionnaire structure
   */
  static getQuestionnaire(): Questionnaire {
    return questionnaireData as any;
  }

  /**
   * Get test profiles from questionnaire data
   */
  static getTestProfiles(): any[] {
    const questionnaire = questionnaireData as any;
    return questionnaire.test_profiles || [];
  }

  /**
   * Get a specific question by ID
   */
  static getQuestion(questionId: string): Question | null {
    const questionnaire = this.getQuestionnaire();
    const question = questionnaire.questions.find(q => q.id === questionId);
    return question || null;
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
    
    for (const question of questionnaire.questions) {
      if (question.required && !responses[question.id]) {
        errors.push(`${question.label} is required`);
      }

      // Validate specific field formats
      if (question.id === 'q2_zip' && responses[question.id]) {
        const zipCode = responses[question.id];
        if (!/^\d{5}$/.test(zipCode)) {
          errors.push('ZIP code must be exactly 5 digits');
        }
      }

      // Validate multi-select arrays
      if (question.type === 'multi_select' && responses[question.id]) {
        if (!Array.isArray(responses[question.id])) {
          errors.push(`${question.label} must be an array of selections`);
        }
      }

      // Validate matrix responses
      if (question.type === 'matrix' && responses[question.id]) {
        const matrixResponse = responses[question.id];
        if (typeof matrixResponse !== 'object') {
          errors.push(`${question.label} must be an object with subject ratings`);
        }
      }
    }

    // Add warnings for incomplete optional sections
    if (!responses.q9_interests_text || responses.q9_interests_text.trim().length < 10) {
      warnings.push('Consider adding more detail about your interests and hobbies');
    }

    if (!responses.q10_experience_text || responses.q10_experience_text.trim().length < 10) {
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
    // Map new question IDs to profile fields
    const workEnvironment = Array.isArray(responses.q3_work_environment) ? responses.q3_work_environment : [];
    const workStyle = Array.isArray(responses.q4_work_style) ? responses.q4_work_style : [];
    const thinkingStyle = Array.isArray(responses.q5_thinking_style) ? responses.q5_thinking_style : [];
    const academicInterests = Array.isArray(responses.q7_academic_interests) ? responses.q7_academic_interests : [];
    const traits = Array.isArray(responses.q11_traits) ? responses.q11_traits : [];
    const constraints = Array.isArray(responses.q15_constraints) ? responses.q15_constraints : [];

    // Convert grade to number
    const gradeMap: { [key: string]: number } = {
      '9': 9,
      '10': 10,
      '11': 11,
      '12': 12
    };
    const grade = gradeMap[responses.q1_grade] || 9;

    // Handle academic performance matrix
    const academicPerformance = typeof responses.q8_academic_performance === 'object' 
      ? responses.q8_academic_performance 
      : {};

    const profile: StudentProfile = {
      // Basic Information
      grade,
      zipCode: responses.q2_zip || '',

      // Work Environment Preferences
      workEnvironment,

      // Work Style
      workStyle,

      // Thinking Style
      thinkingStyle,

      // Education & Training
      educationWillingness: responses.q6_education_willingness || "I'm not sure yet",

      // Academic Interests
      academicInterests,

      // Academic Performance
      academicPerformance,

      // Interests & Experience
      interests: responses.q9_interests_text || '',
      experience: responses.q10_experience_text || 'None yet',

      // Personality & Traits
      traits,
      otherTraits: '', // Not in new structure

      // Values
      incomeImportance: responses.q12_income_importance || 'I\'m not sure yet',
      stabilityImportance: responses.q13_stability_importance || 'Not very important',
      helpingImportance: responses.q14_helping_importance || 'I\'m not sure yet',

      // Lifestyle & Constraints
      constraints,

      // Decision Readiness & Risk
      decisionPressure: responses.q16_decision_urgency || 'I\'m just exploring right now',
      riskTolerance: responses.q17_risk_tolerance || 'I\'m not sure yet',

      // Support & Confidence
      supportLevel: responses.q18_support_confidence || 'I\'m not sure',
      careerConfidence: responses.q19_career_confidence || 'Very unsure',

      // Reflection
      impactStatement: responses.q20_impact_text || '',
      inspiration: responses.q21_inspiration_text || ''
    };

    return profile;
  }

  /**
   * Get questionnaire progress
   */
  static getProgress(responses: QuestionnaireResponse): {
    completedQuestions: number;
    totalQuestions: number;
    percentComplete: number;
  } {
    const questionnaire = this.getQuestionnaire();
    let completedQuestions = 0;
    const totalQuestions = questionnaire.questions.length;

    for (const question of questionnaire.questions) {
      if (responses[question.id] && responses[question.id] !== '') {
        completedQuestions++;
      }
    }

    const percentComplete = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

    return {
      completedQuestions,
      totalQuestions,
      percentComplete
    };
  }

  /**
   * Get next incomplete question
   */
  static getNextIncompleteQuestion(responses: QuestionnaireResponse): Question | null {
    const questionnaire = this.getQuestionnaire();
    
    for (const question of questionnaire.questions) {
      if (question.required && (!responses[question.id] || responses[question.id] === '')) {
        return question;
      }
    }
    
    return null; // All required questions complete
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
        grade: responses.q1_grade,
        zipCode: responses.q2_zip
      },
      preferences: {
        workEnvironment: responses.q3_work_environment,
        workStyle: responses.q4_work_style,
        thinkingStyle: responses.q5_thinking_style,
        constraints: responses.q15_constraints
      },
      academics: {
        interests: responses.q7_academic_interests,
        performance: responses.q8_academic_performance,
        educationWillingness: responses.q6_education_willingness
      },
      personality: {
        traits: responses.q11_traits,
        riskTolerance: responses.q17_risk_tolerance,
        careerConfidence: responses.q19_career_confidence
      },
      goals: {
        incomeImportance: responses.q12_income_importance,
        stabilityImportance: responses.q13_stability_importance,
        helpingImportance: responses.q14_helping_importance,
        impactStatement: responses.q20_impact_text,
        inspiration: responses.q21_inspiration_text
      }
    };
  }
}