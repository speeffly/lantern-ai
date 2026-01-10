export interface StudentProfile {
  // Basic Information
  grade: number;
  zipCode: string;

  // Work Environment Preferences (multi-select)
  workEnvironment: string[];

  // Work Style (multi-select)
  workStyle: string[];

  // Thinking Style (multi-select)
  thinkingStyle: string[];

  // Education & Training (single choice)
  educationWillingness: string;

  // Academic Interests (multi-select)
  academicInterests: string[];

  // Academic Performance (matrix)
  academicPerformance: {
    [subject: string]: string;
  };

  // Interests & Experience (text)
  interests: string;
  experience: string;

  // Personality & Traits (multi-select + optional text)
  traits: string[];
  otherTraits?: string;

  // Values (single choice)
  incomeImportance: string;
  stabilityImportance: string;
  helpingImportance: string;

  // Lifestyle & Constraints (multi-select)
  constraints: string[];

  // Decision Readiness & Risk (single choice)
  decisionPressure: string;
  riskTolerance: string;

  // Support & Confidence (single choice)
  supportLevel: string;
  careerConfidence: string;

  // Reflection (optional text)
  impactStatement?: string;
  inspiration?: string;
}

export interface Career {
  career_id: string;
  name: string;
  primary_cluster: string;
  secondary_cluster?: string;
  edu_required_level: number; // 0=HS, 1=cert, 2=associate, 3=bachelor+
  challenge_level: number; // 0-3
  physical_demand: number; // 0-3
  time_to_entry_years: number;
  cost_level: number; // 0-1
}

export interface ClusterScore {
  cluster_id: string;
  name: string;
  score: number;
  reasoning: string[];
}

export interface CareerRecommendation {
  career: Career;
  score: number;
  fit_category: 'best_fit' | 'good_fit' | 'stretch_option';
  reasoning: string[];
  feasibility_notes?: string[];
}

export interface FourYearPlan {
  grade_9?: YearPlan;
  grade_10?: YearPlan;
  grade_11?: YearPlan;
  grade_12?: YearPlan;
  post_graduation: PostGradPlan;
}

export interface YearPlan {
  focus: string;
  courses: string[];
  activities: string[];
  milestones: string[];
}

export interface PostGradPlan {
  immediate_steps: string[];
  education_path: string;
  timeline: string;
  estimated_cost: string;
}

export interface ComparisonQuestion {
  question: string;
  career_a: string;
  career_b: string;
  factors: string[];
}

export interface RecommendationResult {
  student_profile_summary: {
    grade: number;
    readiness_level: string;
    key_strengths: string[];
    primary_interests: string[];
  };
  
  top_clusters: ClusterScore[];
  
  career_recommendations: {
    best_fit: CareerRecommendation[];
    good_fit: CareerRecommendation[];
    stretch_options: CareerRecommendation[];
  };
  
  four_year_plan: FourYearPlan;
  
  comparison_questions: ComparisonQuestion[];
  
  disclaimer: string;
  
  generated_at: string;
}

export interface ClusterValueProfile {
  income: number;
  stability: number;
  helping: number;
  risk: number;
}

export interface ClusterDefinition {
  id: string;
  name: string;
  description: string;
  value_profile: ClusterValueProfile;
}