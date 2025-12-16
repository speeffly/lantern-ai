import { StudentProfile, CareerMatch } from '../types';

export interface CourseRecommendation {
  id: string;
  subject: string;
  courseName: string;
  courseCode?: string;
  year: number;
  semester: 'Fall' | 'Spring' | 'Both' | 'Summer';
  credits: number;
  priority: 'Essential' | 'Highly Recommended' | 'Recommended' | 'Optional';
  reasoning: string;
  prerequisites: string[];
  careerRelevance: string[];
  skillsGained: string[];
  availability: 'Common' | 'Some Schools' | 'Rare' | 'Online Only';
  alternatives?: string[];
}

export interface AcademicPlan {
  currentYear: {
    grade: number;
    courses: CourseRecommendation[];
    totalCredits: number;
  };
  nextYear: {
    grade: number;
    courses: CourseRecommendation[];
    totalCredits: number;
  };
  longTerm: {
    grades: number[];
    courses: CourseRecommendation[];
    postSecondary: string[];
  };
  dualEnrollment: CourseRecommendation[];
  onlineOptions: CourseRecommendation[];
  summerPrograms: string[];
}

export class CourseRecommendationService {
  private static readonly HIGH_SCHOOL_COURSES: CourseRecommendation[] = [
    // Mathematics
    {
      id: 'math-algebra2',
      subject: 'Mathematics',
      courseName: 'Algebra II',
      courseCode: 'MATH-302',
      year: 11,
      semester: 'Both',
      credits: 1,
      priority: 'Essential',
      reasoning: 'Foundation for advanced math and science courses',
      prerequisites: ['Algebra I', 'Geometry'],
      careerRelevance: ['All STEM careers', 'Healthcare', 'Infrastructure'],
      skillsGained: ['Problem solving', 'Logical reasoning', 'Mathematical modeling'],
      availability: 'Common'
    },
    {
      id: 'math-precalc',
      subject: 'Mathematics',
      courseName: 'Pre-Calculus',
      courseCode: 'MATH-401',
      year: 12,
      semester: 'Both',
      credits: 1,
      priority: 'Highly Recommended',
      reasoning: 'Prepares for college-level mathematics',
      prerequisites: ['Algebra II'],
      careerRelevance: ['Engineering', 'Advanced Healthcare', 'Technical careers'],
      skillsGained: ['Advanced algebra', 'Trigonometry', 'Functions'],
      availability: 'Common'
    },
    {
      id: 'math-statistics',
      subject: 'Mathematics',
      courseName: 'Statistics',
      courseCode: 'MATH-350',
      year: 12,
      semester: 'Spring',
      credits: 0.5,
      priority: 'Recommended',
      reasoning: 'Important for data analysis in many careers',
      prerequisites: ['Algebra II'],
      careerRelevance: ['Healthcare', 'Business', 'Research'],
      skillsGained: ['Data analysis', 'Probability', 'Statistical reasoning'],
      availability: 'Some Schools'
    },

    // Sciences
    {
      id: 'sci-biology',
      subject: 'Science',
      courseName: 'Biology',
      courseCode: 'SCI-201',
      year: 10,
      semester: 'Both',
      credits: 1,
      priority: 'Essential',
      reasoning: 'Foundation for all healthcare careers',
      prerequisites: [],
      careerRelevance: ['Registered Nurse', 'Medical Assistant', 'Healthcare'],
      skillsGained: ['Life sciences', 'Scientific method', 'Lab techniques'],
      availability: 'Common'
    },
    {
      id: 'sci-chemistry',
      subject: 'Science',
      courseName: 'Chemistry',
      courseCode: 'SCI-301',
      year: 11,
      semester: 'Both',
      credits: 1,
      priority: 'Essential',
      reasoning: 'Required for nursing and medical programs',
      prerequisites: ['Biology', 'Algebra I'],
      careerRelevance: ['Registered Nurse', 'Pharmacy Tech', 'Lab Tech'],
      skillsGained: ['Chemical processes', 'Lab safety', 'Analytical thinking'],
      availability: 'Common'
    },
    {
      id: 'sci-physics',
      subject: 'Science',
      courseName: 'Physics',
      courseCode: 'SCI-401',
      year: 12,
      semester: 'Both',
      credits: 1,
      priority: 'Highly Recommended',
      reasoning: 'Important for engineering and technical careers',
      prerequisites: ['Algebra II'],
      careerRelevance: ['Electrician', 'Engineer', 'Technical careers'],
      skillsGained: ['Physical principles', 'Problem solving', 'Mathematical applications'],
      availability: 'Common'
    },
    {
      id: 'sci-anatomy',
      subject: 'Science',
      courseName: 'Anatomy & Physiology',
      courseCode: 'SCI-450',
      year: 12,
      semester: 'Both',
      credits: 1,
      priority: 'Highly Recommended',
      reasoning: 'Direct preparation for healthcare careers',
      prerequisites: ['Biology', 'Chemistry'],
      careerRelevance: ['Registered Nurse', 'Physical Therapist', 'Medical Assistant'],
      skillsGained: ['Human body systems', 'Medical terminology', 'Health sciences'],
      availability: 'Some Schools',
      alternatives: ['Health Sciences', 'Medical Terminology']
    },

    // Career & Technical Education
    {
      id: 'cte-health',
      subject: 'Career & Technical Education',
      courseName: 'Health Sciences',
      courseCode: 'CTE-401',
      year: 11,
      semester: 'Both',
      credits: 2,
      priority: 'Essential',
      reasoning: 'Hands-on healthcare experience and certification prep',
      prerequisites: ['Biology'],
      careerRelevance: ['All Healthcare careers'],
      skillsGained: ['Medical terminology', 'Patient care basics', 'Healthcare systems'],
      availability: 'Some Schools'
    },
    {
      id: 'cte-construction',
      subject: 'Career & Technical Education',
      courseName: 'Construction Technology',
      courseCode: 'CTE-301',
      year: 11,
      semester: 'Both',
      credits: 2,
      priority: 'Essential',
      reasoning: 'Hands-on experience with construction and trades',
      prerequisites: [],
      careerRelevance: ['Construction Worker', 'Electrician', 'Plumber'],
      skillsGained: ['Tool usage', 'Safety protocols', 'Building techniques'],
      availability: 'Some Schools'
    },
    {
      id: 'cte-automotive',
      subject: 'Career & Technical Education',
      courseName: 'Automotive Technology',
      courseCode: 'CTE-350',
      year: 12,
      semester: 'Both',
      credits: 2,
      priority: 'Recommended',
      reasoning: 'Mechanical skills applicable to many trades',
      prerequisites: [],
      careerRelevance: ['Mechanic', 'Technician', 'Infrastructure careers'],
      skillsGained: ['Mechanical systems', 'Troubleshooting', 'Technical skills'],
      availability: 'Some Schools'
    },

    // English & Communication
    {
      id: 'eng-composition',
      subject: 'English',
      courseName: 'English Composition',
      courseCode: 'ENG-401',
      year: 12,
      semester: 'Both',
      credits: 1,
      priority: 'Essential',
      reasoning: 'Communication skills essential for all careers',
      prerequisites: ['English III'],
      careerRelevance: ['All careers'],
      skillsGained: ['Written communication', 'Critical thinking', 'Research skills'],
      availability: 'Common'
    },
    {
      id: 'eng-speech',
      subject: 'English',
      courseName: 'Speech & Communication',
      courseCode: 'ENG-350',
      year: 11,
      semester: 'Fall',
      credits: 0.5,
      priority: 'Highly Recommended',
      reasoning: 'Oral communication skills for patient/client interaction',
      prerequisites: [],
      careerRelevance: ['Healthcare', 'Customer service', 'Leadership roles'],
      skillsGained: ['Public speaking', 'Interpersonal communication', 'Confidence'],
      availability: 'Common'
    },

    // Technology
    {
      id: 'tech-computer',
      subject: 'Technology',
      courseName: 'Computer Applications',
      courseCode: 'TECH-201',
      year: 10,
      semester: 'Fall',
      credits: 0.5,
      priority: 'Essential',
      reasoning: 'Digital literacy required in all modern careers',
      prerequisites: [],
      careerRelevance: ['All careers'],
      skillsGained: ['Microsoft Office', 'Digital literacy', 'Data management'],
      availability: 'Common'
    },
    {
      id: 'tech-cad',
      subject: 'Technology',
      courseName: 'Computer-Aided Design (CAD)',
      courseCode: 'TECH-401',
      year: 12,
      semester: 'Spring',
      credits: 0.5,
      priority: 'Recommended',
      reasoning: 'Technical drawing skills for engineering and construction',
      prerequisites: ['Geometry'],
      careerRelevance: ['Electrician', 'Engineer', 'Construction'],
      skillsGained: ['Technical drawing', 'Design software', 'Spatial reasoning'],
      availability: 'Some Schools'
    },

    // Social Studies
    {
      id: 'ss-psychology',
      subject: 'Social Studies',
      courseName: 'Psychology',
      courseCode: 'SS-401',
      year: 12,
      semester: 'Spring',
      credits: 0.5,
      priority: 'Recommended',
      reasoning: 'Understanding human behavior for healthcare careers',
      prerequisites: [],
      careerRelevance: ['Healthcare', 'Counseling', 'Social services'],
      skillsGained: ['Human behavior', 'Mental health awareness', 'Empathy'],
      availability: 'Some Schools'
    }
  ];

  /**
   * Generate personalized academic plan
   */
  static generateAcademicPlan(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    currentGrade: number = 11
  ): AcademicPlan {
    console.log(`📚 Generating academic plan for grade ${currentGrade} student`);

    const isHealthcareInterested = this.isHealthcareFocused(profile, careerMatches);
    const isInfrastructureFocused = this.isInfrastructureFocused(profile, careerMatches);

    return {
      currentYear: this.getCurrentYearPlan(currentGrade, isHealthcareInterested, isInfrastructureFocused),
      nextYear: this.getNextYearPlan(currentGrade + 1, isHealthcareInterested, isInfrastructureFocused),
      longTerm: this.getLongTermPlan(currentGrade, isHealthcareInterested, isInfrastructureFocused),
      dualEnrollment: this.getDualEnrollmentOptions(isHealthcareInterested, isInfrastructureFocused),
      onlineOptions: this.getOnlineOptions(isHealthcareInterested, isInfrastructureFocused),
      summerPrograms: this.getSummerPrograms(isHealthcareInterested, isInfrastructureFocused)
    };
  }

  /**
   * Check if student is healthcare-focused
   */
  private static isHealthcareFocused(profile: Partial<StudentProfile>, careerMatches: CareerMatch[]): boolean {
    const hasHealthcareInterest = profile.interests?.includes('Healthcare') || 
                                 profile.interests?.includes('Helping Others');
    const topCareerIsHealthcare = careerMatches[0]?.career.sector === 'healthcare';
    
    return hasHealthcareInterest || topCareerIsHealthcare;
  }

  /**
   * Check if student is infrastructure-focused
   */
  private static isInfrastructureFocused(profile: Partial<StudentProfile>, careerMatches: CareerMatch[]): boolean {
    const hasInfrastructureInterest = profile.interests?.includes('Infrastructure') || 
                                     profile.interests?.includes('Hands-on Work');
    const topCareerIsInfrastructure = careerMatches[0]?.career.sector === 'infrastructure';
    
    return hasInfrastructureInterest || topCareerIsInfrastructure;
  }

  /**
   * Get current year course recommendations
   */
  private static getCurrentYearPlan(
    grade: number,
    isHealthcare: boolean,
    isInfrastructure: boolean
  ) {
    const courses = this.HIGH_SCHOOL_COURSES.filter(course => {
      // Filter by grade level
      if (course.year !== grade) return false;

      // Prioritize based on career focus
      if (isHealthcare && course.careerRelevance.some(career => 
        career.toLowerCase().includes('healthcare') || 
        career.toLowerCase().includes('nurse') ||
        career.toLowerCase().includes('medical')
      )) {
        return true;
      }

      if (isInfrastructure && course.careerRelevance.some(career =>
        career.toLowerCase().includes('electrician') ||
        career.toLowerCase().includes('construction') ||
        career.toLowerCase().includes('infrastructure')
      )) {
        return true;
      }

      // Include essential courses for all students
      return course.priority === 'Essential';
    });

    // Add core courses that all students need
    const coreCourses = this.HIGH_SCHOOL_COURSES.filter(course => 
      course.year === grade && 
      (course.subject === 'English' || course.subject === 'Mathematics') &&
      course.priority === 'Essential'
    );

    const allCourses = [...new Set([...courses, ...coreCourses])];
    const totalCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);

    return {
      grade,
      courses: allCourses,
      totalCredits
    };
  }

  /**
   * Get next year course recommendations
   */
  private static getNextYearPlan(
    grade: number,
    isHealthcare: boolean,
    isInfrastructure: boolean
  ) {
    if (grade > 12) {
      return {
        grade,
        courses: [],
        totalCredits: 0
      };
    }

    return this.getCurrentYearPlan(grade, isHealthcare, isInfrastructure);
  }

  /**
   * Get long-term academic planning
   */
  private static getLongTermPlan(
    currentGrade: number,
    isHealthcare: boolean,
    isInfrastructure: boolean
  ) {
    const remainingGrades: number[] = [];
    for (let grade = currentGrade + 2; grade <= 12; grade++) {
      remainingGrades.push(grade);
    }

    const futureCourses = this.HIGH_SCHOOL_COURSES.filter(course =>
      remainingGrades.includes(course.year) &&
      (course.priority === 'Highly Recommended' || course.priority === 'Essential')
    );

    const postSecondary = [];
    if (isHealthcare) {
      postSecondary.push(
        'Community College - Nursing Program (ADN)',
        'Certified Nursing Assistant (CNA) Program',
        'Medical Assistant Certificate Program',
        'Health Sciences Prerequisites'
      );
    }

    if (isInfrastructure) {
      postSecondary.push(
        'Trade School - Electrical Program',
        'Apprenticeship Programs',
        'Community College - Construction Management',
        'HVAC Certification Program'
      );
    }

    return {
      grades: remainingGrades,
      courses: futureCourses,
      postSecondary
    };
  }

  /**
   * Get dual enrollment opportunities
   */
  private static getDualEnrollmentOptions(isHealthcare: boolean, isInfrastructure: boolean): CourseRecommendation[] {
    const dualEnrollment: CourseRecommendation[] = [];

    if (isHealthcare) {
      dualEnrollment.push({
        id: 'dual-anatomy',
        subject: 'Science',
        courseName: 'College Anatomy & Physiology I',
        year: 12,
        semester: 'Fall',
        credits: 3,
        priority: 'Highly Recommended',
        reasoning: 'Get college credit for nursing prerequisites',
        prerequisites: ['Biology', 'Chemistry'],
        careerRelevance: ['Registered Nurse', 'Healthcare'],
        skillsGained: ['College-level science', 'Medical terminology', 'Study skills'],
        availability: 'Some Schools'
      });
    }

    if (isInfrastructure) {
      dualEnrollment.push({
        id: 'dual-construction',
        subject: 'Career & Technical Education',
        courseName: 'Introduction to Construction',
        year: 12,
        semester: 'Both',
        credits: 3,
        priority: 'Recommended',
        reasoning: 'Earn college credit while learning trade skills',
        prerequisites: [],
        careerRelevance: ['Construction', 'Trades'],
        skillsGained: ['Construction basics', 'Safety certification', 'College experience'],
        availability: 'Some Schools'
      });
    }

    return dualEnrollment;
  }

  /**
   * Get online course options
   */
  private static getOnlineOptions(isHealthcare: boolean, isInfrastructure: boolean): CourseRecommendation[] {
    const online: CourseRecommendation[] = [
      {
        id: 'online-medical-term',
        subject: 'Health Sciences',
        courseName: 'Medical Terminology',
        year: 11,
        semester: 'Both',
        credits: 0.5,
        priority: 'Highly Recommended',
        reasoning: 'Essential vocabulary for healthcare careers',
        prerequisites: [],
        careerRelevance: ['All Healthcare careers'],
        skillsGained: ['Medical vocabulary', 'Healthcare communication', 'Self-directed learning'],
        availability: 'Online Only'
      }
    ];

    return isHealthcare ? online : [];
  }

  /**
   * Get summer program recommendations
   */
  private static getSummerPrograms(isHealthcare: boolean, isInfrastructure: boolean): string[] {
    const programs = [];

    if (isHealthcare) {
      programs.push(
        'Hospital Volunteer Program',
        'Red Cross First Aid/CPR Certification',
        'Health Sciences Summer Camp',
        'Nursing Assistant Training Program'
      );
    }

    if (isInfrastructure) {
      programs.push(
        'Construction Skills Workshop',
        'Electrical Safety Training',
        'OSHA 10-Hour Safety Certification',
        'Trade Skills Summer Program'
      );
    }

    programs.push(
      'Community College Dual Enrollment',
      'Job Shadowing Program',
      'Career Exploration Workshop'
    );

    return programs;
  }

  /**
   * Get course alternatives for schools with limited offerings
   */
  static getCourseAlternatives(courseId: string): string[] {
    const course = this.HIGH_SCHOOL_COURSES.find(c => c.id === courseId);
    return course?.alternatives || [];
  }

  /**
   * Get graduation requirements check
   */
  static checkGraduationRequirements(completedCourses: string[]): {
    met: boolean;
    missing: string[];
    recommendations: string[];
  } {
    const required = [
      'English (4 credits)',
      'Mathematics (3 credits)',
      'Science (3 credits)',
      'Social Studies (3 credits)',
      'Physical Education (1 credit)',
      'Health (0.5 credits)',
      'Electives (6.5 credits)'
    ];

    // This would be more sophisticated in production
    return {
      met: completedCourses.length >= 20,
      missing: required.slice(0, Math.max(0, 20 - completedCourses.length)),
      recommendations: [
        'Focus on career-relevant electives',
        'Consider dual enrollment opportunities',
        'Maintain strong GPA for post-secondary options'
      ]
    };
  }
}