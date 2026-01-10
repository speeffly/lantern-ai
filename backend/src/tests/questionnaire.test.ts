import { QuestionnaireService } from '../services/questionnaireService';

describe('QuestionnaireService', () => {
  const sampleResponses = {
    grade: '11th',
    zipCode: '12345',
    workEnvironment: ['Indoors (offices, hospitals, schools)'],
    workStyle: ['Helping people directly'],
    thinkingStyle: ['Helping people overcome challenges'],
    educationWillingness: '2–4 years (college or technical school)',
    academicInterests: ['Science (Biology, Chemistry, Physics)'],
    academicPerformance: {
      'Math': 'Good',
      'Science (Biology, Chemistry, Physics)': 'Excellent'
    },
    interests: 'I love science and helping people',
    experience: 'Volunteer at hospital',
    traits: ['Compassionate and caring', 'Analytical and logical'],
    incomeImportance: 'Somewhat important',
    stabilityImportance: 'Very important',
    helpingImportance: 'Very important',
    constraints: ['Predictable hours'],
    decisionPressure: 'Want to narrow this year',
    riskTolerance: 'Somewhat comfortable',
    supportLevel: 'Some support available',
    careerConfidence: 'Somewhat confident'
  };

  describe('getQuestionnaire', () => {
    it('should return questionnaire structure', () => {
      const questionnaire = QuestionnaireService.getQuestionnaire();
      
      expect(questionnaire).toBeDefined();
      expect(questionnaire.version).toBe('v1');
      expect(questionnaire.title).toBe('Lantern AI Career Questionnaire');
      expect(questionnaire.sections).toBeInstanceOf(Array);
      expect(questionnaire.sections.length).toBeGreaterThan(0);
    });

    it('should have all required sections', () => {
      const questionnaire = QuestionnaireService.getQuestionnaire();
      const sectionIds = questionnaire.sections.map(s => s.id);
      
      const expectedSections = [
        'basic_info',
        'work_environment',
        'work_style',
        'thinking_style',
        'education_training',
        'academic_interests',
        'academic_performance',
        'interests_experience',
        'personality_traits',
        'values',
        'lifestyle_constraints',
        'decision_readiness',
        'support_confidence',
        'reflection'
      ];
      
      expectedSections.forEach(sectionId => {
        expect(sectionIds).toContain(sectionId);
      });
    });
  });

  describe('getSection', () => {
    it('should return specific section', () => {
      const section = QuestionnaireService.getSection('basic_info');
      
      expect(section).toBeDefined();
      expect(section?.id).toBe('basic_info');
      expect(section?.title).toBe('Basic Information');
      expect(section?.questions).toBeInstanceOf(Array);
    });

    it('should return null for non-existent section', () => {
      const section = QuestionnaireService.getSection('non_existent');
      expect(section).toBeNull();
    });
  });

  describe('validateResponses', () => {
    it('should validate complete responses as valid', () => {
      const validation = QuestionnaireService.validateResponses(sampleResponses);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const incompleteResponses = {
        grade: '10th'
        // Missing zipCode and other required fields
      };
      
      const validation = QuestionnaireService.validateResponses(incompleteResponses);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(error => error.includes('ZIP code'))).toBe(true);
    });

    it('should validate ZIP code format', () => {
      const invalidZipResponses = {
        ...sampleResponses,
        zipCode: '123' // Invalid format
      };
      
      const validation = QuestionnaireService.validateResponses(invalidZipResponses);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('ZIP code must be exactly 5 digits'))).toBe(true);
    });

    it('should provide warnings for incomplete optional sections', () => {
      const minimalResponses = {
        ...sampleResponses,
        interests: '', // Empty interests
        experience: '' // Empty experience
      };
      
      const validation = QuestionnaireService.validateResponses(minimalResponses);
      
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(warning => warning.includes('interests'))).toBe(true);
      expect(validation.warnings.some(warning => warning.includes('experience'))).toBe(true);
    });
  });

  describe('convertToStudentProfile', () => {
    it('should convert questionnaire responses to StudentProfile format', () => {
      const profile = QuestionnaireService.convertToStudentProfile(sampleResponses);
      
      expect(profile.grade).toBe(11);
      expect(profile.zipCode).toBe('12345');
      expect(profile.workEnvironment).toEqual(['Indoors (offices, hospitals, schools)']);
      expect(profile.workStyle).toEqual(['Helping people directly']);
      expect(profile.educationWillingness).toBe('2–4 years (college or technical school)');
      expect(profile.academicInterests).toEqual(['Science (Biology, Chemistry, Physics)']);
      expect(profile.traits).toEqual(['Compassionate and caring', 'Analytical and logical']);
    });

    it('should handle missing optional fields', () => {
      const minimalResponses = {
        grade: '9th',
        zipCode: '54321',
        workEnvironment: [],
        workStyle: [],
        thinkingStyle: [],
        academicInterests: [],
        traits: [],
        constraints: []
      };
      
      const profile = QuestionnaireService.convertToStudentProfile(minimalResponses);
      
      expect(profile.grade).toBe(9);
      expect(profile.zipCode).toBe('54321');
      expect(profile.workEnvironment).toEqual([]);
      expect(profile.educationWillingness).toBe("I'm not sure yet");
      expect(profile.interests).toBe('');
      expect(profile.experience).toBe('None yet');
    });

    it('should convert grade strings to numbers correctly', () => {
      const gradeTests = [
        { input: '9th', expected: 9 },
        { input: '10th', expected: 10 },
        { input: '11th', expected: 11 },
        { input: '12th', expected: 12 },
        { input: 'invalid', expected: 9 } // Default fallback
      ];
      
      gradeTests.forEach(({ input, expected }) => {
        const responses = { ...sampleResponses, grade: input };
        const profile = QuestionnaireService.convertToStudentProfile(responses);
        expect(profile.grade).toBe(expected);
      });
    });
  });

  describe('getProgress', () => {
    it('should calculate progress correctly', () => {
      const progress = QuestionnaireService.getProgress(sampleResponses);
      
      expect(progress.totalSections).toBeGreaterThan(0);
      expect(progress.totalQuestions).toBeGreaterThan(0);
      expect(progress.completedQuestions).toBeGreaterThan(0);
      expect(progress.percentComplete).toBeGreaterThan(0);
      expect(progress.percentComplete).toBeLessThanOrEqual(100);
    });

    it('should show 0% progress for empty responses', () => {
      const progress = QuestionnaireService.getProgress({});
      
      expect(progress.completedQuestions).toBe(0);
      expect(progress.completedSections).toBe(0);
      expect(progress.percentComplete).toBe(0);
    });
  });

  describe('getNextSection', () => {
    it('should return first incomplete section', () => {
      const partialResponses = {
        grade: '10th',
        zipCode: '12345'
        // Missing other required fields
      };
      
      const nextSection = QuestionnaireService.getNextSection(partialResponses);
      
      expect(nextSection).toBeDefined();
      expect(nextSection?.id).toBeDefined();
    });

    it('should return null when all required sections are complete', () => {
      const nextSection = QuestionnaireService.getNextSection(sampleResponses);
      
      // Should be null if all required fields are provided
      expect(nextSection).toBeNull();
    });
  });

  describe('generateSummary', () => {
    it('should generate comprehensive summary', () => {
      const summary = QuestionnaireService.generateSummary(sampleResponses);
      
      expect(summary.basicInfo).toBeDefined();
      expect(summary.preferences).toBeDefined();
      expect(summary.academics).toBeDefined();
      expect(summary.personality).toBeDefined();
      expect(summary.goals).toBeDefined();
      
      expect(summary.basicInfo.grade).toBe('11th');
      expect(summary.basicInfo.zipCode).toBe('12345');
      expect(summary.preferences.workEnvironment).toEqual(['Indoors (offices, hospitals, schools)']);
      expect(summary.academics.interests).toEqual(['Science (Biology, Chemistry, Physics)']);
      expect(summary.personality.traits).toEqual(['Compassionate and caring', 'Analytical and logical']);
    });
  });

  describe('Integration with RecommendationEngine', () => {
    it('should produce valid StudentProfile for recommendation engine', () => {
      const profile = QuestionnaireService.convertToStudentProfile(sampleResponses);
      
      // Verify all required fields for recommendation engine are present
      expect(typeof profile.grade).toBe('number');
      expect(typeof profile.zipCode).toBe('string');
      expect(Array.isArray(profile.workEnvironment)).toBe(true);
      expect(Array.isArray(profile.workStyle)).toBe(true);
      expect(Array.isArray(profile.thinkingStyle)).toBe(true);
      expect(Array.isArray(profile.academicInterests)).toBe(true);
      expect(Array.isArray(profile.traits)).toBe(true);
      expect(Array.isArray(profile.constraints)).toBe(true);
      expect(typeof profile.academicPerformance).toBe('object');
      expect(typeof profile.educationWillingness).toBe('string');
      expect(typeof profile.incomeImportance).toBe('string');
      expect(typeof profile.stabilityImportance).toBe('string');
      expect(typeof profile.helpingImportance).toBe('string');
    });
  });
});