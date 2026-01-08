import { CareerService } from './careerService';
import { CareerMatch, AssessmentAnswer } from '../types';
import { AIRecommendationService } from './aiRecommendationService';
import { DynamicSalaryService } from './dynamicSalaryService';
import { EnhancedCareerService } from './enhancedCareerService';
import { CareerMatchingService, EnhancedCareerMatch } from './careerMatchingService';

export interface CounselorAssessmentResponse {
  grade?: number;
  zipCode?: string;
  workEnvironment?: string;
  handsOnPreference?: string;
  problemSolving?: string;
  helpingOthers?: string;
  educationCommitment?: string;
  incomeImportance?: string;
  jobSecurity?: string;
  subjectsStrengths?: string[];
  interestsPassions?: string;
}

export interface JobRecommendation {
  career: {
    id: string;
    title: string;
    description: string;
    sector: string;
    averageSalary: number;
    requiredEducation: string;
    certifications?: string[];
    growthOutlook?: string;
  };
  matchScore: number;
  matchReasons: string[];
  localOpportunities: {
    estimatedJobs: number;
    averageLocalSalary: number;
    topEmployers: string[];
    distanceFromStudent: number;
  };
  educationPath: {
    highSchoolCourses: string[];
    postSecondaryOptions: string[];
    timeToCareer: string;
    estimatedCost: number;
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
}

export interface FourYearActionPlan {
  currentGrade: number;
  academicPlan: {
    [grade: number]: {
      coreCourses: string[];
      electiveCourses: string[];
      extracurriculars: string[];
      summerActivities: string[];
      milestones: string[];
    };
  };
  careerPreparation: {
    skillsToDevelope: Array<{
      skill: string;
      howToAcquire: string;
      timeline: string;
    }>;
    experienceOpportunities: Array<{
      activity: string;
      when: string;
      benefit: string;
    }>;
    networkingSteps: Array<{
      action: string;
      timeline: string;
      purpose: string;
    }>;
  };
  postGraduationPath: {
    immediateSteps: string[];
    educationOptions: Array<{
      option: string;
      duration: string;
      cost: string;
      location: string;
    }>;
    careerEntry: {
      targetPositions: string[];
      expectedSalary: string;
      advancement: string[];
    };
  };
}

export interface CounselorRecommendation {
  studentProfile: {
    grade: number;
    location: string;
    strengths: string[];
    interests: string[];
    careerReadiness: string;
  };
  topJobMatches: JobRecommendation[];
  fourYearPlan: FourYearActionPlan;
  aiRecommendations?: {
    academicPlan: any;
    localJobs: any[];
    careerPathway: any;
    skillGaps: any[];
    actionItems: any[];
  };
  parentSummary: {
    overview: string;
    keyRecommendations: string[];
    supportActions: string[];
    timelineHighlights: string[];
  };
  counselorNotes: {
    assessmentInsights: string[];
    recommendationRationale: string[];
    followUpActions: string[];
    parentMeetingTopics: string[];
  };
}

export class CounselorGuidanceService {
  /**
   * Generate comprehensive counselor recommendations
   */
  static async generateCounselorRecommendations(
    responses: CounselorAssessmentResponse
  ): Promise<CounselorRecommendation> {
    try {
      console.log('🎓 Generating counselor recommendations for grade', responses.grade, 'student');
      console.log('📍 Location:', responses.zipCode);

      // Convert responses to student profile format
      const studentProfile = this.convertToStudentProfile(responses);
      console.log('👤 Student Profile:', JSON.stringify(studentProfile, null, 2));
      
      // STEP 1: Get enhanced career matches with AI insights and individual pathways
      console.log('\n' + '='.repeat(80));
      console.log('🤖 STEP 1: GETTING ENHANCED CAREER MATCHES WITH AI INSIGHTS');
      console.log('='.repeat(80));
      
      const enhancedResult = await EnhancedCareerService.getCareerMatchesWithDynamicSalaries(
        studentProfile,
        this.convertToAssessmentAnswers(responses),
        responses.zipCode || ''
      );
      
      // Get AI-enhanced matches with individual career pathways
      const enhancedCareerMatches = await CareerMatchingService.getEnhancedMatches(
        studentProfile,
        this.convertToAssessmentAnswers(responses),
        enhancedResult.careerMatches
      );
      
      console.log('📊 Enhanced Career Analysis Results:');
      console.log('   - Career matches found:', enhancedResult.careerMatches.length);
      console.log('   - AI-enhanced matches:', enhancedCareerMatches.length);
      console.log('   - Dynamic data available:', enhancedResult.insights.dynamicDataAvailable);
      console.log('   - Jobs analyzed:', enhancedResult.insights.jobsAnalyzed);
      console.log('   - Average salary difference:', enhancedResult.insights.averageSalaryDifference.toLocaleString());
      console.log('   - Recommendation quality:', enhancedResult.insights.recommendationQuality);
      
      // Log salary data details
      console.log('\n📈 SALARY ANALYSIS BREAKDOWN:');
      enhancedResult.salaryData.salaryAnalyses.forEach((analysis, index) => {
        console.log(`   ${index + 1}. ${analysis.careerTitle}:`);
        console.log(`      - Average Salary: $${analysis.averageSalary.toLocaleString()}`);
        console.log(`      - Salary Range: $${analysis.salaryRange.min.toLocaleString()} - $${analysis.salaryRange.max.toLocaleString()}`);
        console.log(`      - Job Count: ${analysis.jobCount}`);
        console.log(`      - Data Source: ${analysis.dataSource}`);
        console.log(`      - Last Updated: ${analysis.lastUpdated.toISOString()}`);
      });
      
      console.log('\n🏢 MARKET INSIGHTS:');
      console.log('   - Highest Paying Career:', enhancedResult.salaryData.marketInsights.highestPaying);
      console.log('   - Most Jobs Available:', enhancedResult.salaryData.marketInsights.mostJobs);
      console.log('   - Average Across All Careers: $' + enhancedResult.salaryData.marketInsights.averageAcrossAllCareers.toLocaleString());
      console.log('='.repeat(80));
      
      // Use enhanced career matches instead of basic ones
      const careerMatches = enhancedResult.careerMatches;
      
      // Get top 15 matches for high school students
      const topMatches = careerMatches
        .filter(match => this.isAppropriateForHighSchool(match.career))
        .slice(0, 15);

      console.log('\n🎯 TOP CAREER MATCHES (after filtering):');
      topMatches.slice(0, 5).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.career.title} (${match.matchScore}% match)`);
        console.log(`      - Sector: ${match.career.sector}`);
        console.log(`      - Average Salary: $${match.career.averageSalary.toLocaleString()}`);
        console.log(`      - Required Education: ${match.career.requiredEducation}`);
        if (match.localSalaryData) {
          console.log(`      - Local Salary Data: ${match.localSalaryData.source} (${match.localSalaryData.jobCount} jobs)`);
        }
      });

      // STEP 2: Generate detailed job recommendations with enhanced career pathways
      console.log('\n' + '='.repeat(80));
      console.log('💼 STEP 2: GENERATING JOB RECOMMENDATIONS WITH ENHANCED CAREER PATHWAYS');
      console.log('='.repeat(80));
      
      const jobRecommendations = await this.generateJobRecommendationsFromEnhanced(
        enhancedCareerMatches, 
        responses.zipCode || '', 
        responses.grade || 11,
        enhancedResult.salaryData
      );

      console.log('✅ Job recommendations generated with dynamic salary data');
      jobRecommendations.slice(0, 3).forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.career.title}:`);
        console.log(`      - Match Score: ${job.matchScore}%`);
        console.log(`      - Local Average Salary: $${job.localOpportunities.averageLocalSalary.toLocaleString()}`);
        console.log(`      - Estimated Jobs: ${job.localOpportunities.estimatedJobs}`);
        console.log(`      - Distance: ${job.localOpportunities.distanceFromStudent} miles`);
      });

      // Create 4-year action plan
      const fourYearPlan = this.createFourYearActionPlan(
        responses.grade || 11,
        topMatches,
        responses
      );

      // Generate parent summary
      const parentSummary = this.createParentSummary(
        jobRecommendations,
        fourYearPlan,
        responses
      );

      // Generate AI-powered recommendations
      console.log('\n' + '='.repeat(80));
      console.log('🤖 STEP 3: GENERATING AI-POWERED RECOMMENDATIONS');
      console.log('='.repeat(80));
      let aiRecommendations: {
        academicPlan: any;
        localJobs: any[];
        careerPathway: any;
        skillGaps: any[];
        actionItems: any[];
      } | undefined = undefined;
      
      try {
        // Convert responses to assessment answers format for AI service
        const assessmentAnswers = this.convertToAssessmentAnswers(responses);
        
        const aiResult = await AIRecommendationService.generateRecommendations(
          studentProfile,
          assessmentAnswers,
          topMatches,
          responses.zipCode || '',
          responses.grade || 11
        );
        
        // Convert AIRecommendations to the expected format
        aiRecommendations = {
          academicPlan: aiResult.academicPlan,
          localJobs: aiResult.localJobs || [],
          careerPathway: aiResult.careerPathway,
          skillGaps: aiResult.skillGaps || [],
          actionItems: aiResult.actionItems || []
        };
        
        console.log('✅ AI recommendations generated successfully for counselor assessment');
      } catch (aiError) {
        const useRealAI = process.env.USE_REAL_AI === 'true';
        
        if (useRealAI) {
          console.error('❌ Real AI mode failed - OpenAI integration required:', aiError);
          // Set error state to show real AI is expected but failed
          aiRecommendations = {
            academicPlan: { error: 'Real AI mode enabled but OpenAI integration failed' },
            localJobs: [],
            careerPathway: { error: 'Real AI mode enabled but OpenAI integration failed' },
            skillGaps: [],
            actionItems: []
          };
        } else {
          console.log('⚠️ AI recommendations failed, but fallback mode should have handled this:', aiError);
          aiRecommendations = undefined;
        }
      }

      // Create counselor notes
      const counselorNotes = this.createCounselorNotes(
        responses,
        jobRecommendations,
        fourYearPlan
      );

      console.log('\n' + '='.repeat(80));
      console.log('✅ COUNSELOR RECOMMENDATIONS GENERATION COMPLETE');
      console.log('='.repeat(80));
      console.log('📊 Final Summary:');
      console.log('   - Top career matches:', jobRecommendations.length);
      console.log('   - Dynamic salary data used:', enhancedResult.insights.dynamicDataAvailable ? 'YES' : 'NO');
      console.log('   - Total jobs analyzed:', enhancedResult.insights.jobsAnalyzed);
      console.log('   - AI recommendations:', aiRecommendations ? 'Generated' : 'Not available');
      console.log('='.repeat(80) + '\n');

      return {
        studentProfile: {
          grade: responses.grade || 11,
          location: responses.zipCode || 'Unknown',
          strengths: this.identifyStrengths(responses),
          interests: this.extractInterests(responses),
          careerReadiness: this.assessCareerReadiness(responses)
        },
        topJobMatches: jobRecommendations,
        fourYearPlan,
        aiRecommendations,
        parentSummary,
        counselorNotes
      };
    } catch (error) {
      console.error('❌ Error generating counselor recommendations:', error);
      throw error;
    }
  }

  /**
   * Convert counselor responses to assessment answers format for AI service
   */
  private static convertToAssessmentAnswers(responses: CounselorAssessmentResponse): AssessmentAnswer[] {
    const answers: AssessmentAnswer[] = [];
    
    // Convert each response to an assessment answer
    if (responses.grade) {
      answers.push({
        questionId: 'grade',
        answer: responses.grade.toString(),
        timestamp: new Date()
      });
    }
    
    if (responses.zipCode) {
      answers.push({
        questionId: 'zip_code',
        answer: responses.zipCode,
        timestamp: new Date()
      });
    }
    
    if (responses.workEnvironment) {
      answers.push({
        questionId: 'work_environment',
        answer: responses.workEnvironment,
        timestamp: new Date()
      });
    }
    
    if (responses.handsOnPreference) {
      answers.push({
        questionId: 'interests',
        answer: responses.handsOnPreference,
        timestamp: new Date()
      });
    }
    
    if (responses.subjectsStrengths) {
      answers.push({
        questionId: 'skills',
        answer: responses.subjectsStrengths.join(', '),
        timestamp: new Date()
      });
    }
    
    if (responses.educationCommitment) {
      answers.push({
        questionId: 'education',
        answer: responses.educationCommitment,
        timestamp: new Date()
      });
    }
    
    if (responses.interestsPassions) {
      answers.push({
        questionId: 'interests_detailed',
        answer: responses.interestsPassions,
        timestamp: new Date()
      });
    }
    
    return answers;
  }

  /**
   * Convert counselor responses to student profile format
   */
  private static convertToStudentProfile(responses: CounselorAssessmentResponse): any {
    const interests: string[] = [];
    const skills: string[] = [];

    // Map responses to interests and skills
    if (responses.handsOnPreference?.includes('tools')) {
      interests.push('Hands-on Work', 'Infrastructure');
    }
    if (responses.handsOnPreference?.includes('people')) {
      interests.push('Healthcare', 'Helping Others');
    }
    if (responses.handsOnPreference?.includes('computers')) {
      interests.push('Technology', 'Problem Solving');
    }
    if (responses.helpingOthers?.includes('Very important')) {
      interests.push('Healthcare', 'Community Impact');
    }

    // Map academic strengths to skills
    if (responses.subjectsStrengths?.includes('Math')) {
      skills.push('Problem Solving', 'Analytical Thinking');
    }
    if (responses.subjectsStrengths?.includes('Science')) {
      skills.push('Scientific Method', 'Research');
    }
    if (responses.subjectsStrengths?.includes('English')) {
      skills.push('Communication', 'Writing');
    }

    // Add interests from free text
    if (responses.interestsPassions) {
      const passionKeywords = this.extractKeywordsFromText(responses.interestsPassions);
      interests.push(...passionKeywords);
    }

    return {
      interests: [...new Set(interests)], // Remove duplicates
      skills: [...new Set(skills)],
      educationGoal: this.mapEducationGoal(responses.educationCommitment),
      workEnvironment: this.mapWorkEnvironment(responses.workEnvironment),
      grade: responses.grade
    };
  }

  /**
   * Check if career is appropriate for high school students
   */
  private static isAppropriateForHighSchool(career: any): boolean {
    // Filter out careers requiring advanced degrees or extensive experience
    const inappropriateKeywords = [
      'surgeon', 'physician', 'lawyer', 'judge', 'professor', 
      'executive', 'senior manager', 'director', 'chief'
    ];
    
    const title = career.title.toLowerCase();
    return !inappropriateKeywords.some(keyword => title.includes(keyword));
  }

  /**
   * Generate detailed job recommendations from enhanced career matches (includes individual career pathways)
   */
  private static async generateJobRecommendationsFromEnhanced(
    enhancedMatches: EnhancedCareerMatch[],
    zipCode: string,
    grade: number,
    salaryData: any
  ): Promise<JobRecommendation[]> {
    const recommendations: JobRecommendation[] = [];

    for (const match of enhancedMatches) {
      // Get local job market data using dynamic salary analysis
      const localData = await this.getLocalJobDataWithDynamicSalary(match.career, zipCode, salaryData);
      
      // Get education path
      const educationPath = this.createEducationPath(match.career, grade);
      
      recommendations.push({
        career: match.career,
        matchScore: match.matchScore,
        matchReasons: match.reasoningFactors || this.generateMatchReasons(match),
        localOpportunities: localData,
        educationPath,
        careerPathway: match.careerPathway, // Include the individual career pathway
        skillGaps: match.skillGaps // Include the individual skill gaps
      });
    }

    return recommendations;
  }

  /**
   * Generate detailed job recommendations with dynamic salary data
   */
  private static async generateJobRecommendationsWithDynamicSalary(
    careerMatches: CareerMatch[],
    zipCode: string,
    grade: number,
    salaryData: any
  ): Promise<JobRecommendation[]> {
    const recommendations: JobRecommendation[] = [];

    for (const match of careerMatches) {
      // Get local job market data using dynamic salary analysis
      const localData = await this.getLocalJobDataWithDynamicSalary(match.career, zipCode, salaryData);
      
      // Get education path
      const educationPath = this.createEducationPath(match.career, grade);
      
      recommendations.push({
        career: match.career,
        matchScore: match.matchScore,
        matchReasons: match.reasoningFactors || this.generateMatchReasons(match),
        localOpportunities: localData,
        educationPath
      });
    }

    return recommendations;
  }

  /**
   * Generate detailed job recommendations
   */
  private static async generateJobRecommendations(
    careerMatches: CareerMatch[],
    zipCode: string,
    grade: number
  ): Promise<JobRecommendation[]> {
    const recommendations: JobRecommendation[] = [];

    for (const match of careerMatches) {
      // Get local job market data
      const localData = await this.getLocalJobData(match.career, zipCode);
      
      // Get education path
      const educationPath = this.createEducationPath(match.career, grade);
      
      recommendations.push({
        career: match.career,
        matchScore: match.matchScore,
        matchReasons: match.reasoningFactors || this.generateMatchReasons(match),
        localOpportunities: localData,
        educationPath
      });
    }

    return recommendations;
  }

  /**
   * Get local job market data using dynamic salary analysis
   */
  private static async getLocalJobDataWithDynamicSalary(career: any, zipCode: string, salaryData: any) {
    console.log(`💰 Getting dynamic salary data for ${career.title} in ${zipCode}...`);
    
    // Find the salary analysis for this career
    const salaryAnalysis = salaryData.salaryAnalyses.find(
      (analysis: any) => analysis.careerTitle === career.title
    );

    if (salaryAnalysis) {
      console.log(`   ✅ Found dynamic salary data for ${career.title}:`);
      console.log(`      - Average Salary: $${salaryAnalysis.averageSalary.toLocaleString()}`);
      console.log(`      - Job Count: ${salaryAnalysis.jobCount}`);
      console.log(`      - Data Source: ${salaryAnalysis.dataSource}`);
      console.log(`      - Salary Range: $${salaryAnalysis.salaryRange.min.toLocaleString()} - $${salaryAnalysis.salaryRange.max.toLocaleString()}`);
      
      // Use dynamic salary data
      return {
        estimatedJobs: salaryAnalysis.jobCount,
        averageLocalSalary: salaryAnalysis.averageSalary,
        topEmployers: this.generateLocalEmployers(career.sector),
        distanceFromStudent: Math.floor(Math.random() * 35) + 5 // 5-40 miles (still simulated)
      };
    } else {
      console.log(`   ⚠️ No dynamic salary data found for ${career.title}, using fallback`);
      
      // Fallback to simulated data
      return this.getLocalJobDataFallback(career, zipCode);
    }
  }

  /**
   * Get local job market data for a career (original method, now fallback)
   */
  private static async getLocalJobData(career: any, zipCode: string) {
    console.log(`📊 Getting simulated job data for ${career.title} in ${zipCode}...`);
    return this.getLocalJobDataFallback(career, zipCode);
  }

  /**
   * Fallback method for local job data (simulated)
   */
  private static getLocalJobDataFallback(career: any, _zipCode: string) {
    // Simulate local job market analysis
    const baseJobs = Math.floor(Math.random() * 50) + 10; // 10-60 jobs
    const salaryVariation = 0.1; // ±10%
    const distance = Math.floor(Math.random() * 35) + 5; // 5-40 miles

    const simulatedData = {
      estimatedJobs: baseJobs,
      averageLocalSalary: Math.round(career.averageSalary * (1 + (Math.random() - 0.5) * salaryVariation)),
      topEmployers: this.generateLocalEmployers(career.sector),
      distanceFromStudent: distance
    };

    console.log(`   📊 Simulated data: ${baseJobs} jobs, $${simulatedData.averageLocalSalary.toLocaleString()} avg salary`);
    return simulatedData;
  }

  /**
   * Generate local employers based on sector
   */
  private static generateLocalEmployers(sector: string): string[] {
    const employers = {
      healthcare: ['Regional Medical Center', 'Community Health Clinic', 'Rural Hospital Network'],
      infrastructure: ['County Public Works', 'Local Construction Co.', 'Regional Utilities'],
      education: ['School District', 'Community College', 'Local Library System'],
      technology: ['Local IT Services', 'Regional Tech Company', 'Government IT Department']
    };

    return employers[sector as keyof typeof employers] || ['Local Business', 'Regional Company', 'Government Agency'];
  }

  /**
   * Create education path for a career
   */
  private static createEducationPath(career: any, _currentGrade: number) {
    const highSchoolCourses = this.getRecommendedCourses(career);
    const postSecondaryOptions = this.getPostSecondaryOptions(career);
    const timeToCareer = this.calculateTimeToCareer(career.requiredEducation);
    const estimatedCost = this.estimateEducationCost(career.requiredEducation);

    return {
      highSchoolCourses,
      postSecondaryOptions,
      timeToCareer,
      estimatedCost
    };
  }

  /**
   * Get recommended high school courses for a career
   */
  private static getRecommendedCourses(career: any): string[] {
    const courseMap: { [key: string]: string[] } = {
      healthcare: ['Biology', 'Chemistry', 'Anatomy & Physiology', 'Health Sciences', 'Psychology'],
      infrastructure: ['Geometry', 'Physics', 'Construction Technology', 'CAD', 'Shop Class'],
      technology: ['Computer Science', 'Mathematics', 'Physics', 'Statistics'],
      education: ['English', 'Psychology', 'Speech', 'Subject-specific courses'],
      business: ['Business Math', 'Economics', 'Accounting', 'Marketing', 'Communication']
    };

    return courseMap[career.sector] || ['Core Academic Courses', 'Career-Related Electives'];
  }

  /**
   * Get post-secondary education options
   */
  private static getPostSecondaryOptions(career: any): string[] {
    const educationLevel = career.requiredEducation;
    
    if (educationLevel === 'certificate') {
      return ['Vocational School', 'Community College Certificate', 'Apprenticeship Program'];
    } else if (educationLevel === 'associate') {
      return ['Community College (2-year)', 'Technical College', 'Online Degree Program'];
    } else if (educationLevel === 'bachelor') {
      return ['4-year University', 'State College', 'Online Bachelor\'s Program'];
    }
    
    return ['Various Training Options'];
  }

  /**
   * Calculate time to career entry
   */
  private static calculateTimeToCareer(educationLevel: string): string {
    const timeMap: { [key: string]: string } = {
      'certificate': '6 months - 2 years after high school',
      'associate': '2-3 years after high school',
      'bachelor': '4-5 years after high school',
      'master': '6-7 years after high school'
    };

    return timeMap[educationLevel] || '2-4 years after high school';
  }

  /**
   * Estimate education cost
   */
  private static estimateEducationCost(educationLevel: string): number {
    const costMap: { [key: string]: number } = {
      'certificate': 8000,
      'associate': 15000,
      'bachelor': 40000,
      'master': 60000
    };

    return costMap[educationLevel] || 20000;
  }

  /**
   * Create 4-year action plan
   */
  private static createFourYearActionPlan(
    currentGrade: number,
    topMatches: CareerMatch[],
    responses: CounselorAssessmentResponse
  ): FourYearActionPlan {
    const academicPlan: { [grade: number]: any } = {};
    
    // Generate plan for each remaining grade
    for (let grade = currentGrade; grade <= 12; grade++) {
      academicPlan[grade] = this.createGradePlan(grade, topMatches, responses);
    }

    return {
      currentGrade,
      academicPlan,
      careerPreparation: this.createCareerPreparation(topMatches, responses),
      postGraduationPath: this.createPostGraduationPath(topMatches, responses)
    };
  }

  /**
   * Create plan for specific grade
   */
  private static createGradePlan(
    grade: number,
    topMatches: CareerMatch[],
    responses: CounselorAssessmentResponse
  ) {
    const topCareer = topMatches[0]?.career;
    const isHealthcare = topCareer?.sector === 'healthcare';
    const isInfrastructure = topCareer?.sector === 'infrastructure';

    const baseCourses = {
      9: ['English I', 'Algebra I', 'Biology', 'World History', 'PE/Health'],
      10: ['English II', 'Geometry', 'Chemistry', 'World Geography', 'PE/Health'],
      11: ['English III', 'Algebra II', 'Physics', 'US History', 'Government'],
      12: ['English IV', 'Pre-Calculus/Statistics', 'Economics', 'Electives']
    };

    const careerElectives: { [key: string]: { [key: number]: string[] } } = {
      healthcare: {
        11: ['Health Sciences', 'Psychology', 'Anatomy & Physiology'],
        12: ['Medical Terminology', 'First Aid/CPR', 'Dual Enrollment Biology']
      },
      infrastructure: {
        11: ['Construction Technology', 'CAD', 'Shop Class'],
        12: ['Advanced Construction', 'Electrical Basics', 'Dual Enrollment Math']
      }
    };

    const extracurriculars = {
      healthcare: ['HOSA (Health Occupations)', 'Volunteer at Hospital', 'Red Cross Club'],
      infrastructure: ['Skills USA', 'Robotics Club', 'Construction Club']
    };

    const summerActivities = {
      healthcare: ['Hospital Volunteer', 'CNA Training', 'Health Camp'],
      infrastructure: ['Construction Job', 'Trade Skills Workshop', 'Apprenticeship Prep']
    };

    const sector = isHealthcare ? 'healthcare' : isInfrastructure ? 'infrastructure' : 'general';

    return {
      coreCourses: baseCourses[grade as keyof typeof baseCourses] || [],
      electiveCourses: careerElectives[sector as keyof typeof careerElectives]?.[grade] || ['Career-Related Electives'],
      extracurriculars: extracurriculars[sector as keyof typeof extracurriculars] || ['Career-Related Clubs'],
      summerActivities: summerActivities[sector as keyof typeof summerActivities] || ['Career Exploration'],
      milestones: this.getGradeMilestones(grade, sector)
    };
  }

  /**
   * Get milestones for each grade
   */
  private static getGradeMilestones(grade: number, sector: string): string[] {
    const milestones: { [key: number]: { [key: string]: string[] } } = {
      9: {
        general: ['Establish good study habits', 'Explore career interests', 'Join relevant clubs'],
        healthcare: ['Shadow healthcare workers', 'Learn basic first aid', 'Volunteer in community'],
        infrastructure: ['Learn basic tool safety', 'Visit construction sites', 'Try hands-on projects']
      },
      10: {
        general: ['Maintain strong GPA', 'Develop leadership skills', 'Research career paths'],
        healthcare: ['Complete health sciences course', 'Get CPR certified', 'Job shadow nurses'],
        infrastructure: ['Complete construction tech course', 'Learn blueprint reading', 'Visit trade schools']
      },
      11: {
        general: ['Take SAT/ACT', 'Research colleges/training', 'Apply for scholarships'],
        healthcare: ['Take anatomy course', 'Apply for CNA program', 'Research nursing schools'],
        infrastructure: ['Apply for apprenticeships', 'Get OSHA safety training', 'Research trade programs']
      },
      12: {
        general: ['Complete applications', 'Secure funding', 'Plan transition'],
        healthcare: ['Complete CNA if possible', 'Apply to nursing programs', 'Secure healthcare job'],
        infrastructure: ['Start apprenticeship', 'Apply to trade schools', 'Secure construction job']
      }
    };

    return milestones[grade]?.[sector] || milestones[grade]?.['general'] || [];
  }

  /**
   * Create career preparation plan
   */
  private static createCareerPreparation(
    topMatches: CareerMatch[],
    responses: CounselorAssessmentResponse
  ) {
    const topCareer = topMatches[0]?.career;
    
    return {
      skillsToDevelope: [
        {
          skill: 'Communication',
          howToAcquire: 'Join speech club, practice presentations, customer service job',
          timeline: 'Throughout high school'
        },
        {
          skill: 'Technical Skills',
          howToAcquire: `Take ${topCareer?.sector} courses, online tutorials, hands-on practice`,
          timeline: 'Junior and Senior year'
        },
        {
          skill: 'Work Ethic',
          howToAcquire: 'Part-time job, volunteer work, internships',
          timeline: 'Starting sophomore year'
        }
      ],
      experienceOpportunities: [
        {
          activity: 'Job Shadowing',
          when: 'Junior year',
          benefit: 'See real workplace environment and daily tasks'
        },
        {
          activity: 'Internship/Part-time work',
          when: 'Senior year',
          benefit: 'Gain actual work experience and references'
        },
        {
          activity: 'Volunteer Work',
          when: 'Throughout high school',
          benefit: 'Develop skills and show community commitment'
        }
      ],
      networkingSteps: [
        {
          action: 'Connect with professionals in field',
          timeline: 'Junior year',
          purpose: 'Learn about career paths and opportunities'
        },
        {
          action: 'Join professional student organizations',
          timeline: 'Sophomore year',
          purpose: 'Meet peers and professionals in the field'
        },
        {
          action: 'Attend career fairs and industry events',
          timeline: 'Throughout high school',
          purpose: 'Learn about employers and opportunities'
        }
      ]
    };
  }

  /**
   * Create post-graduation path
   */
  private static createPostGraduationPath(
    topMatches: CareerMatch[],
    _responses: CounselorAssessmentResponse
  ) {
    const topCareer = topMatches[0]?.career;
    
    return {
      immediateSteps: [
        'Complete high school with strong GPA',
        `Apply to ${topCareer?.requiredEducation} programs`,
        'Secure funding for education',
        'Find part-time work in related field'
      ],
      educationOptions: [
        {
          option: 'Local Community College',
          duration: '2 years',
          cost: '$6,000-12,000',
          location: 'Within 30 miles'
        },
        {
          option: 'State University',
          duration: '4 years',
          cost: '$20,000-40,000',
          location: 'In-state options'
        },
        {
          option: 'Trade School',
          duration: '6 months - 2 years',
          cost: '$5,000-15,000',
          location: 'Regional options'
        }
      ],
      careerEntry: {
        targetPositions: [
          `Entry-level ${topCareer?.title}`,
          `${topCareer?.title} Trainee`,
          `Assistant ${topCareer?.title}`
        ],
        expectedSalary: `$${Math.round((topCareer?.averageSalary || 40000) * 0.7).toLocaleString()} - $${Math.round((topCareer?.averageSalary || 40000) * 0.9).toLocaleString()}`,
        advancement: [
          `Senior ${topCareer?.title}`,
          `Lead ${topCareer?.title}`,
          'Supervisory roles',
          'Specialized positions'
        ]
      }
    };
  }

  /**
   * Create parent summary
   */
  private static createParentSummary(
    jobRecommendations: JobRecommendation[],
    _fourYearPlan: FourYearActionPlan,
    responses: CounselorAssessmentResponse
  ) {
    const topJob = jobRecommendations[0];
    
    return {
      overview: `Based on the assessment, your child shows strong potential for ${topJob?.career.title} and related careers. They demonstrate ${this.identifyStrengths(responses).join(', ')} and express interest in ${this.extractInterests(responses).join(', ')}.`,
      keyRecommendations: [
        `Focus on ${topJob?.educationPath.highSchoolCourses.slice(0, 3).join(', ')} courses`,
        `Plan for ${topJob?.career.requiredEducation} education after high school`,
        `Encourage ${topJob?.career.sector} extracurricular activities`,
        `Support job shadowing and volunteer opportunities`
      ],
      supportActions: [
        'Help research local training programs and colleges',
        'Support extracurricular activities related to career interests',
        'Encourage part-time work or volunteering in the field',
        'Assist with scholarship and financial aid applications'
      ],
      timelineHighlights: [
        `Grade ${responses.grade}: Focus on core academics and career exploration`,
        `Grade ${Math.min((responses.grade || 11) + 1, 12)}: Take career-specific courses and gain experience`,
        'After graduation: Pursue recommended education/training path',
        `Career entry: Target ${topJob?.career.title} positions with $${topJob?.localOpportunities.averageLocalSalary.toLocaleString()} average salary`
      ]
    };
  }

  /**
   * Create counselor notes
   */
  private static createCounselorNotes(
    responses: CounselorAssessmentResponse,
    jobRecommendations: JobRecommendation[],
    _fourYearPlan: FourYearActionPlan
  ) {
    return {
      assessmentInsights: [
        `Student is in grade ${responses.grade} and shows ${this.assessCareerReadiness(responses)} career readiness`,
        `Primary interests align with ${jobRecommendations[0]?.career.sector} sector`,
        `Education commitment level: ${responses.educationCommitment}`,
        `Work environment preference: ${responses.workEnvironment}`
      ],
      recommendationRationale: [
        `Top career match (${jobRecommendations[0]?.career.title}) selected based on interest alignment and local opportunities`,
        `Education path matches student's commitment level and financial considerations`,
        `Local job market shows ${jobRecommendations[0]?.localOpportunities.estimatedJobs} estimated positions`,
        `Salary expectations align with student's income importance level`
      ],
      followUpActions: [
        'Schedule follow-up meeting in 3 months to review progress',
        'Connect student with professionals in recommended field',
        'Monitor academic performance in recommended courses',
        'Assist with scholarship and program applications'
      ],
      parentMeetingTopics: [
        'Review career recommendations and rationale',
        'Discuss 4-year academic plan and course selections',
        'Explore post-secondary education options and costs',
        'Plan for career exploration activities and experiences'
      ]
    };
  }

  // Helper methods
  private static identifyStrengths(responses: CounselorAssessmentResponse): string[] {
    const strengths: string[] = [];
    
    if (responses.subjectsStrengths?.includes('Math')) strengths.push('analytical thinking');
    if (responses.subjectsStrengths?.includes('Science')) strengths.push('scientific reasoning');
    if (responses.subjectsStrengths?.includes('English')) strengths.push('communication skills');
    if (responses.problemSolving?.includes('step-by-step')) strengths.push('logical problem-solving');
    if (responses.helpingOthers?.includes('Very important')) strengths.push('empathy and service orientation');
    
    return strengths.length > 0 ? strengths : ['diverse interests', 'learning potential'];
  }

  private static extractInterests(responses: CounselorAssessmentResponse): string[] {
    const interests: string[] = [];
    
    if (responses.handsOnPreference?.includes('tools')) interests.push('hands-on work');
    if (responses.handsOnPreference?.includes('people')) interests.push('helping others');
    if (responses.handsOnPreference?.includes('computers')) interests.push('technology');
    if (responses.workEnvironment?.includes('Outdoors')) interests.push('outdoor work');
    
    return interests.length > 0 ? interests : ['career exploration'];
  }

  private static assessCareerReadiness(responses: CounselorAssessmentResponse): string {
    let readinessScore = 0;
    
    if (responses.educationCommitment && !responses.educationCommitment.includes('Unsure')) readinessScore++;
    if (responses.incomeImportance && !responses.incomeImportance.includes('Unsure')) readinessScore++;
    if (responses.interestsPassions && responses.interestsPassions.length > 100) readinessScore++;
    if (responses.subjectsStrengths && responses.subjectsStrengths.length > 0) readinessScore++;
    
    if (readinessScore >= 3) return 'high';
    if (readinessScore >= 2) return 'moderate';
    return 'developing';
  }

  private static extractKeywordsFromText(text: string): string[] {
    const keywords: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Healthcare keywords
    if (lowerText.includes('health') || lowerText.includes('medical') || lowerText.includes('help')) {
      keywords.push('Healthcare');
    }
    
    // Technology keywords
    if (lowerText.includes('computer') || lowerText.includes('tech') || lowerText.includes('digital')) {
      keywords.push('Technology');
    }
    
    // Infrastructure keywords
    if (lowerText.includes('build') || lowerText.includes('construct') || lowerText.includes('fix')) {
      keywords.push('Infrastructure');
    }
    
    return keywords;
  }

  private static mapEducationGoal(commitment?: string): string {
    if (!commitment) return 'certificate';
    
    if (commitment.includes('right away')) return 'certificate';
    if (commitment.includes('Short-term')) return 'certificate';
    if (commitment.includes('2-year')) return 'associate';
    if (commitment.includes('4-year')) return 'bachelor';
    if (commitment.includes('Advanced')) return 'master';
    
    return 'certificate';
  }

  private static mapWorkEnvironment(environment?: string): string {
    if (!environment) return 'mixed';
    
    if (environment.includes('Outdoors')) return 'outdoor';
    if (environment.includes('Indoors')) return 'indoor';
    if (environment.includes('home')) return 'remote';
    
    return 'mixed';
  }

  private static generateMatchReasons(_match: CareerMatch): string[] {
    return [
      `Strong alignment with your interests and preferences`,
      `Good local job opportunities in your area`,
      `Education requirements match your commitment level`,
      `Salary potential aligns with your goals`
    ];
  }
}