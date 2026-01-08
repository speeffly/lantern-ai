// Core type definitions for Lantern AI

export type UserRole = 'student' | 'counselor' | 'parent' | 'teacher' | 'admin';

export type Sector = 'healthcare' | 'infrastructure' | 'technology' | 'education' | 'business' | 'creative' | 'public-service' | 'agriculture' | 'transportation' | 'hospitality' | 'manufacturing' | 'retail' | 'finance' | 'legal' | 'science';

export type EducationLevel = 'high-school' | 'certificate' | 'associate' | 'bachelor';

export type DemandLevel = 'high' | 'medium' | 'low';

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends User {
  role: 'student';
  firstName: string;
  lastName: string;
  grade?: number;
  zipCode?: string;
  profileCompleted: boolean;
  consentGiven: boolean;
}

export interface Counselor extends User {
  role: 'counselor';
  firstName: string;
  lastName: string;
  schoolId: string;
}

export interface Parent extends User {
  role: 'parent';
  firstName: string;
  lastName: string;
  children: {
    studentId: string;
    firstName: string;
    lastName: string;
    grade?: number;
  }[];
}

export interface SessionData {
  sessionId: string;
  profileData?: Partial<StudentProfile>;
  assessmentAnswers?: AssessmentAnswer[];
  createdAt: Date;
  expiresAt: Date;
}

// Assessment Types
export interface AssessmentQuestion {
  id: string;
  order: number;
  text: string;
  type: 'multiple-choice' | 'text' | 'scale';
  options?: string[];
  category: 'interests' | 'skills' | 'preferences' | 'education';
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | number;
  timestamp: Date;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  interests: string[];
  skills: string[];
  workEnvironment: 'indoor' | 'outdoor' | 'mixed';
  teamPreference: 'team' | 'solo' | 'both';
  educationGoal: EducationLevel;
  zipCode: string;
  completedAt: Date;
  updatedAt: Date;
}

// Career Types
export interface Career {
  id: string;
  title: string;
  sector: Sector;
  description: string;
  responsibilities: string[];
  requiredEducation: EducationLevel;
  certifications: string[];
  averageSalary: number;
  salaryRange: {
    min: number;
    max: number;
  };
  growthOutlook: string;
  onetCode?: string;
}

export interface CareerMatch {
  careerId: string;
  career: Career;
  matchScore: number;
  reasoningFactors: string[];
  localDemand: DemandLevel;
  localSalary: {
    min: number;
    max: number;
    location: string;
  };
  localEmployers: string[];
  localSalaryData?: {
    source: 'adzuna' | 'static';
    jobCount: number;
    lastUpdated: Date;
  };
}

// Pathway Types
export interface CareerPathway {
  id: string;
  careerId: string;
  stages: PathwayStage[];
  totalDuration: string;
  estimatedCost: number;
}

export interface PathwayStage {
  order: number;
  title: string;
  description: string;
  duration: string;
  requirements: string[];
  providers: string[];
  cost?: number;
}

// Training & Programs
export interface TrainingProgram {
  id: string;
  name: string;
  provider: string;
  type: 'apprenticeship' | 'certificate' | 'internship' | 'vocational';
  sector: Sector;
  targetCareers: string[];
  duration: string;
  cost: number;
  isPaid: boolean;
  location: {
    zipCode: string;
    city: string;
    state: string;
  };
  eligibility: string[];
  applicationUrl?: string;
  applicationDeadline?: Date;
  isActive: boolean;
}

// School & Course Types
export interface School {
  id: string;
  name: string;
  district: string;
  zipCode: string;
  city: string;
  state: string;
}

export interface Course {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  gradeLevels: number[];
  category: string;
  isCTE: boolean;
  relatedCareers: string[];
}

// Action Plan Types
export interface ActionPlan {
  id: string;
  studentId: string;
  careerId: string;
  actions: Action[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'meeting' | 'application' | 'research' | 'custom';
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  reminderEnabled: boolean;
  reminderDate?: Date;
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  type: 'counselor-outreach' | 'program-inquiry' | 'reminder';
  subject: string;
  body: string;
  variables: string[];
}

// Counselor Dashboard Types
export interface StudentProgress {
  studentId: string;
  student: Student;
  profileStatus: 'not-started' | 'in-progress' | 'complete';
  hasSelectedCareer: boolean;
  lastActivity: Date;
  targetCareers: string[];
}

export interface CounselorNote {
  id: string;
  counselorId: string;
  studentId: string;
  note: string;
  createdAt: Date;
}

export interface AggregateTrends {
  totalStudents: number;
  completedAssessments: number;
  topInterests: { interest: string; count: number }[];
  topCareers: { career: string; count: number }[];
  sectorDistribution: { healthcare: number; infrastructure: number };
}

// Parent Summary Types
export interface ParentSummary {
  studentName: string;
  topInterests: string[];
  selectedCareers: {
    title: string;
    sector: Sector;
    pathway: string;
    localSalary: string;
    demand: DemandLevel;
  }[];
  nextSteps: string[];
  generatedAt: Date;
  language: 'en' | 'es';
}

// Profile Types for Database
export interface CounselorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  schoolId: string;
  department?: string;
  yearsExperience?: number;
  specializations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Recommendation Types
export interface CourseRecommendation {
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  prerequisites?: string[];
  provider: string;
  semester: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIRecommendations {
  localJobs: LocalJobOpportunity[];
  academicPlan: {
    currentYear: CourseRecommendation[];
    nextYear: CourseRecommendation[];
    longTerm: CourseRecommendation[];
  };
  careerPathway?: {
    steps: string[];
    timeline: string;
    requirements: string[];
  };
  skillGaps?: {
    skill: string;
    importance: string;
    howToAcquire: string;
  }[];
  actionItems?: {
    title: string;
    description: string;
    priority: string;
    timeline: string;
  }[];
}

export interface LocalJobOpportunity {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  distance: number;
  source: string;
  url?: string;
  posted?: string;
  category?: string;
}

// Relationship Types
export interface Relationship {
  id: string;
  primaryUserId: string;
  secondaryUserId: string;
  relationshipType: 'parent-child' | 'counselor-student' | 'teacher-student';
  status: 'pending' | 'active' | 'inactive';
  createdAt: Date;
  createdBy: string;
}

export interface RelationshipWithUsers {
  id: string;
  primary_user_id: string;
  secondary_user_id: string;
  relationship_type: string;
  status: string;
  created_at: Date;
  created_by: string;
  primary_user: User;
  secondary_user: User;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Admin Types
export interface DataUpload {
  id: string;
  type: 'courses' | 'programs' | 'careers';
  filename: string;
  uploadedBy: string;
  recordsProcessed: number;
  recordsFailed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors?: string[];
  uploadedAt: Date;
  completedAt?: Date;
}
