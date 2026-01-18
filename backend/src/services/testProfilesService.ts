import testProfilesData from '../data/test-profiles.json';

export interface TestProfile {
  profile_id: string;
  name: string;
  q1_grade_zip: {
    grade: string;
    zipCode: string;
  };
  q3_career_knowledge: string;
  q3a_career_categories?: string;
  q3a1_trade_careers?: string;
  q3a2_engineering_careers?: string;
  q3a3_business_careers?: string;
  q3a4_technology_careers?: string;
  q3a5_educator_careers?: string;
  q3a6_healthcare_careers?: string;
  q3a7_public_safety_careers?: string;
  q3a8_researcher_careers?: string;
  q3a9_artist_careers?: string;
  q3a10_law_careers?: string;
  q3a11_other_career?: string;
  q3a3_business_other?: string;
  q3a4_technology_other?: string;
  q3a5_educator_other?: string;
  q3a7_public_safety_other?: string;
  q10_traits?: string[];
  q8_interests_text?: string;
  q9_experience_text?: string;
  q4_academic_performance: Record<string, string>;
  q4b_course_history: Record<string, string | undefined>;
  q5_education_willingness: string;
  q14_constraints: string[];
  q17_support_confidence: string;
  q19_20_impact_inspiration: string;
}

export interface TestProfilesData {
  version: string;
  title: string;
  description: string;
  profiles: TestProfile[];
}

export class TestProfilesService {
  /**
   * Get all test profiles
   */
  static getTestProfiles(): TestProfile[] {
    const data = testProfilesData as any;
    return data.profiles || [];
  }

  /**
   * Get a specific test profile by ID
   */
  static getTestProfile(profileId: string): TestProfile | null {
    const profiles = this.getTestProfiles();
    return profiles.find(profile => profile.profile_id === profileId) || null;
  }

  /**
   * Get test profiles metadata
   */
  static getMetadata(): Omit<TestProfilesData, 'profiles'> {
    const data = testProfilesData as any;
    return {
      version: data.version,
      title: data.title,
      description: data.description
    };
  }

  /**
   * Get test profiles by category
   */
  static getTestProfilesByCategory(): {
    [category: string]: TestProfile[];
  } {
    const profiles = this.getTestProfiles();
    const categories: { [category: string]: TestProfile[] } = {};

    profiles.forEach(profile => {
      const profileId = profile.profile_id;
      let category = 'Other';

      if (profileId.startsWith('S0')) {
        category = 'Skills-based';
      } else if (profileId.startsWith('B0')) {
        category = 'Background-based';
      } else if (profileId.startsWith('R0')) {
        category = 'Race/Ethnicity';
      } else if (profileId.startsWith('U0')) {
        category = 'Urban';
      } else if (profileId.startsWith('RU0')) {
        category = 'Rural';
      } else if (profileId.startsWith('D')) {
        category = 'Decided (Legacy)';
      } else if (profileId.startsWith('U_')) {
        category = 'Undecided (Legacy)';
      } else if (profileId.startsWith('P')) {
        category = 'Path-Known (Legacy)';
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(profile);
    });

    return categories;
  }

  /**
   * Validate a test profile structure
   */
  static validateTestProfile(profile: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!profile.profile_id) {
      errors.push('profile_id is required');
    }
    if (!profile.name) {
      errors.push('name is required');
    }
    if (!profile.q1_grade_zip || !profile.q1_grade_zip.grade || !profile.q1_grade_zip.zipCode) {
      errors.push('q1_grade_zip with grade and zipCode is required');
    }
    if (!profile.q3_career_knowledge) {
      errors.push('q3_career_knowledge is required');
    }
    if (!profile.q4_academic_performance || typeof profile.q4_academic_performance !== 'object') {
      errors.push('q4_academic_performance object is required');
    }
    if (!profile.q4b_course_history || typeof profile.q4b_course_history !== 'object') {
      errors.push('q4b_course_history object is required');
    }
    if (!profile.q5_education_willingness) {
      errors.push('q5_education_willingness is required');
    }
    if (!Array.isArray(profile.q14_constraints)) {
      errors.push('q14_constraints array is required');
    }
    if (!profile.q17_support_confidence) {
      errors.push('q17_support_confidence is required');
    }
    if (!profile.q19_20_impact_inspiration) {
      errors.push('q19_20_impact_inspiration is required');
    }

    // Validate ZIP code format
    if (profile.q1_grade_zip?.zipCode && !/^\d{5}$/.test(profile.q1_grade_zip.zipCode)) {
      errors.push('ZIP code must be exactly 5 digits');
    }

    // Validate grade
    if (profile.q1_grade_zip?.grade && !['9', '10', '11', '12'].includes(profile.q1_grade_zip.grade)) {
      errors.push('Grade must be 9, 10, 11, or 12');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get statistics about test profiles
   */
  static getStatistics(): {
    totalProfiles: number;
    categoryCounts: { [category: string]: number };
    gradeDistribution: { [grade: string]: number };
    careerKnowledgeDistribution: { decided: number; undecided: number };
  } {
    const profiles = this.getTestProfiles();
    const categories = this.getTestProfilesByCategory();
    
    const categoryCounts: { [category: string]: number } = {};
    Object.keys(categories).forEach(category => {
      categoryCounts[category] = categories[category].length;
    });

    const gradeDistribution: { [grade: string]: number } = {};
    const careerKnowledgeDistribution = { decided: 0, undecided: 0 };

    profiles.forEach(profile => {
      const grade = profile.q1_grade_zip.grade;
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

      if (profile.q3_career_knowledge === 'yes') {
        careerKnowledgeDistribution.decided++;
      } else {
        careerKnowledgeDistribution.undecided++;
      }
    });

    return {
      totalProfiles: profiles.length,
      categoryCounts,
      gradeDistribution,
      careerKnowledgeDistribution
    };
  }
}