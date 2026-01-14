import { CareerService } from './careerService';
import { CareerMatch, AssessmentAnswer } from '../types';
import { CleanAIRecommendationService } from './cleanAIRecommendationService';
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

export interface CareerRoadmap {
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
  careerRoadmap: CareerRoadmap;
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
   * Generate 3 career matches for undecided students based on their assessment responses
   * This helps students who are unsure about their career path by providing focused options
   */
  static async generateUndecidedCareerMatches(responses: any): Promise<any> {
    try {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 UNDECIDED CAREER MATCHING - START');
      console.log('='.repeat(80));
      console.log('🤔 Generating career matches for undecided student...');
      console.log('📋 Input responses:', Object.keys(responses));
      
      // Extract basic info
      const grade = responses.basic_info?.grade || responses.grade;
      const zipCode = responses.basic_info?.zipCode || responses.zipCode;

      console.log(`👤 Student: Grade ${grade}, ZIP ${zipCode}`);
      console.log('📊 Total response keys:', Object.keys(responses).length);

      // Create RTCROS-structured prompt specifically for undecided students
      const undecidedPrompt = `ROLE:
You are a Senior Career Counselor AI specializing in helping undecided high school students discover their career paths through personalized analysis of their interests, traits, and experiences.

TASK:
Analyze this undecided student's assessment responses and provide exactly 3 carefully selected career matches that align with their interests, personality traits, and experiences. Each career should represent a different pathway to help them explore diverse options.

CONTEXT:
- Platform: Lantern AI career guidance system for high school students
- Student: Grade ${grade} student in ZIP code ${zipCode}
- Assessment Type: Undecided path - student needs help discovering career interests
- Output Usage: Help student choose from 3 focused career options
- Geographic Focus: Local job market analysis for ZIP ${zipCode}

STUDENT ASSESSMENT RESPONSES:
${Object.entries(responses)
  .filter(([key]) => !['grade', 'zipCode', 'basic_info'].includes(key))
  .map(([questionId, answer]) => {
    const cleanAnswer = typeof answer === 'object' ? JSON.stringify(answer) : answer;
    return `${questionId}: ${cleanAnswer}`;
  })
  .join('\n')}

REASONING FRAMEWORK:
1. DIVERSITY PRINCIPLE: Select 3 careers from different sectors/pathways to give student variety
2. INTEREST ALIGNMENT: Match careers to student's stated interests, hobbies, and experiences
3. TRAIT COMPATIBILITY: Ensure careers align with student's personality traits and work preferences
4. REALISTIC PATHWAYS: Consider student's education commitment and support system
5. LOCAL RELEVANCE: Factor in ZIP code ${zipCode} job market opportunities
6. GROWTH POTENTIAL: Include careers with good advancement opportunities for young professionals

OUTPUT REQUIREMENTS:
Generate a structured JSON response with exactly 3 career matches:

{
  "careerMatches": [
    {
      "careerTitle": "Specific career title",
      "sector": "healthcare/technology/infrastructure/business/education/etc",
      "matchPercentage": 85,
      "whyThisCareer": "Detailed explanation of why this career matches the student's interests, traits, and experiences",
      "averageSalary": 65000,
      "requiredEducation": "Specific education requirement",
      "localJobMarket": {
        "estimatedJobs": 45,
        "averageLocalSalary": 62000,
        "topEmployers": ["Local employer 1", "Local employer 2"],
        "growthOutlook": "Growing/Stable/Declining"
      },
      "dayInTheLife": "Description of what a typical day looks like in this career",
      "careerProgression": "How someone advances in this career over time",
      "skillsNeeded": ["Skill 1", "Skill 2", "Skill 3"],
      "highSchoolPrep": ["Course 1", "Course 2", "Activity 1"]
    }
  ],
  "selectionRationale": "Brief explanation of why these 3 specific careers were chosen for this student",
  "nextSteps": [
    "Specific action item 1",
    "Specific action item 2", 
    "Specific action item 3"
  ],
  "parentGuidance": {
    "summary": "Brief overview for parents about these career recommendations",
    "supportActions": ["How parents can help 1", "How parents can help 2"],
    "keyRecommendations": ["Important point 1", "Important point 2"]
  }
}

STOPPING CRITERIA:
1. EXACTLY 3 CAREERS: Must provide exactly 3 different career options
2. SECTOR DIVERSITY: Ensure the 3 careers span different sectors/industries
3. DETAILED EXPLANATIONS: Each career must have comprehensive "whyThisCareer" explanation
4. ACTIONABLE GUIDANCE: Include specific next steps and high school preparation
5. JSON VALIDATION: Confirm output is valid JSON with no syntax errors
6. PERSONALIZATION: All recommendations must reference specific student responses

CRITICAL: Return ONLY the JSON object. No additional text, explanations, or formatting outside the JSON structure.`;

      // Send to AI
      console.log('\n📤 CALLING AI SERVICE...');
      console.log('   - Prompt length:', undecidedPrompt.length, 'characters');
      console.log('   - About to call CleanAIRecommendationService.callAI()');
      
      const aiResponse = await CleanAIRecommendationService.callAI(undecidedPrompt);
      
      console.log('✅ AI RESPONSE RECEIVED');
      console.log('   - Response length:', aiResponse?.length || 0, 'characters');
      console.log('   - Response preview:', aiResponse?.substring(0, 100) + '...');
      
      // Parse AI response
      console.log('\n🔍 PARSING AI RESPONSE...');
      const parsedResponse = this.parseUndecidedAIResponse(aiResponse, grade, zipCode);
      
      console.log('✅ Undecided career matching completed');
      console.log('📊 Result summary:');
      console.log('   - Career matches:', parsedResponse.topJobMatches?.length || 0);
      console.log('   - Undecided path flag:', parsedResponse.undecidedPath);
      console.log('   - Has selection rationale:', !!parsedResponse.selectionRationale);
      console.log('   - Has aiRecommendations:', !!parsedResponse.aiRecommendations);
      console.log('   - aiProcessed flag:', parsedResponse.aiRecommendations?.aiProcessed);
      console.log('='.repeat(80));
      console.log('🎯 UNDECIDED CAREER MATCHING - SUCCESS');
      console.log('='.repeat(80) + '\n');
      
      return parsedResponse;

    } catch (error) {
      console.error('\n' + '='.repeat(80));
      console.error('❌ UNDECIDED CAREER MATCHING - FAILED');
      console.error('='.repeat(80));
      console.error('❌ Error details:', error);
      console.error('   - Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('   - Error message:', error instanceof Error ? error.message : String(error));
      console.error('   - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('='.repeat(80) + '\n');
      
      // Fallback to basic career matching
      console.log('🔄 FALLING BACK to generateDirectCounselorRecommendations...');
      return this.generateDirectCounselorRecommendations(responses);
    }
  }

  /**
   * Parse the AI response for undecided students into the expected format
   */
  private static parseUndecidedAIResponse(aiResponse: string, grade: string, zipCode: string): any {
    try {
      // Clean the response to extract JSON
      let cleanResponse = aiResponse.trim();
      
      // Remove any markdown formatting
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Find the JSON object
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      // Helper function to ensure arrays
      const ensureArray = (value: any, fallback: string[] = []): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return [value];
        return fallback;
      };
      
      // Transform to expected format with exactly 3 career matches
      const careerMatches = (parsed.careerMatches || []).slice(0, 3).map((match: any, index: number) => ({
        career: {
          id: match.careerTitle?.toLowerCase().replace(/\s+/g, '-') || `career-${index + 1}`,
          title: match.careerTitle || `Career Option ${index + 1}`,
          description: match.whyThisCareer || 'AI-generated career match based on your assessment',
          sector: match.sector || 'general',
          averageSalary: match.averageSalary || 50000,
          requiredEducation: match.requiredEducation || 'High school diploma',
          certifications: [],
          growthOutlook: match.localJobMarket?.growthOutlook || 'Stable'
        },
        matchScore: match.matchPercentage || 75,
        matchReasons: [match.whyThisCareer || 'Based on your assessment responses'],
        localOpportunities: {
          estimatedJobs: match.localJobMarket?.estimatedJobs || 25,
          averageLocalSalary: match.localJobMarket?.averageLocalSalary || match.averageSalary || 50000,
          topEmployers: ensureArray(match.localJobMarket?.topEmployers, ['Local employers']),
          distanceFromStudent: 15
        },
        educationPath: {
          highSchoolCourses: ensureArray(match.highSchoolPrep, ['Core academic courses']),
          postSecondaryOptions: [match.requiredEducation || 'Post-secondary education'],
          timeToCareer: '2-4 years after high school',
          estimatedCost: 25000
        },
        careerDetails: {
          dayInTheLife: match.dayInTheLife || 'Engaging work in your chosen field',
          careerProgression: match.careerProgression || 'Opportunities for advancement and growth',
          skillsNeeded: ensureArray(match.skillsNeeded, ['Professional skills', 'Communication', 'Problem-solving'])
        }
      }));

      console.log('🎯 Created career matches for undecided student:');
      console.log('   - Number of matches:', careerMatches.length);
      careerMatches.forEach((match: any, index: number) => {
        console.log(`   ${index + 1}. ${match.career.title} (${match.career.sector})`);
      });

      return {
        studentProfile: {
          grade: parseInt(grade),
          location: zipCode,
          careerReadiness: 'Exploring Options',
          pathType: 'undecided'
        },
        topJobMatches: careerMatches,
        selectionRationale: parsed.selectionRationale || 'These careers were selected based on your interests and assessment responses',
        nextSteps: ensureArray(parsed.nextSteps, [
          'Research each career option in detail',
          'Talk to professionals in these fields',
          'Consider job shadowing opportunities'
        ]),
        parentSummary: this.generateDynamicParentSummary(careerMatches, parseInt(grade), zipCode),
        counselorNotes: this.generateDynamicCounselorNotes(careerMatches, parseInt(grade), {}),
        careerRoadmap: this.generateDynamicCareerRoadmap(parseInt(grade), careerMatches),
        aiRecommendations: {
          academicPlan: parsed.careerPathway || {},
          localJobs: [],
          careerPathway: parsed.careerPathway || {},
          skillGaps: parsed.skillGaps || [],
          actionItems: parsed.nextSteps || [],
          aiProcessed: true // Flag to indicate real AI was used
        },
        undecidedPath: true,
        rtcrosFramework: true
      };
    } catch (parseError) {
      console.error('❌ Failed to parse undecided AI response:', parseError);
      
      // Enhanced fallback for undecided students
      return {
        studentProfile: {
          grade: parseInt(grade),
          location: zipCode,
          careerReadiness: 'Exploring Options',
          pathType: 'undecided'
        },
        topJobMatches: [
          {
            career: {
              id: 'healthcare-option',
              title: 'Healthcare Professional',
              description: 'Help people and make a difference in healthcare',
              sector: 'healthcare',
              averageSalary: 55000,
              requiredEducation: 'Associate degree or certification'
            },
            matchScore: 80,
            matchReasons: ['Based on your interest in helping others'],
            localOpportunities: {
              estimatedJobs: 30,
              averageLocalSalary: 55000,
              topEmployers: ['Local Hospital', 'Health Clinic'],
              distanceFromStudent: 15
            },
            educationPath: {
              highSchoolCourses: ['Biology', 'Chemistry', 'Health Sciences'],
              postSecondaryOptions: ['Community College Health Program'],
              timeToCareer: '2-3 years',
              estimatedCost: 20000
            }
          },
          {
            career: {
              id: 'technology-option',
              title: 'Technology Specialist',
              description: 'Work with computers and solve technical problems',
              sector: 'technology',
              averageSalary: 60000,
              requiredEducation: 'Certificate or associate degree'
            },
            matchScore: 75,
            matchReasons: ['Based on your problem-solving interests'],
            localOpportunities: {
              estimatedJobs: 25,
              averageLocalSalary: 60000,
              topEmployers: ['Local IT Company', 'Government IT'],
              distanceFromStudent: 20
            },
            educationPath: {
              highSchoolCourses: ['Computer Science', 'Mathematics'],
              postSecondaryOptions: ['Technical College IT Program'],
              timeToCareer: '1-2 years',
              estimatedCost: 15000
            }
          },
          {
            career: {
              id: 'business-option',
              title: 'Business Professional',
              description: 'Work in business operations and customer service',
              sector: 'business',
              averageSalary: 45000,
              requiredEducation: 'High school diploma plus training'
            },
            matchScore: 70,
            matchReasons: ['Based on your communication skills'],
            localOpportunities: {
              estimatedJobs: 40,
              averageLocalSalary: 45000,
              topEmployers: ['Local Businesses', 'Regional Companies'],
              distanceFromStudent: 10
            },
            educationPath: {
              highSchoolCourses: ['Business', 'Communication', 'Mathematics'],
              postSecondaryOptions: ['Business Certificate Program'],
              timeToCareer: '6 months - 1 year',
              estimatedCost: 10000
            }
          }
        ],
        selectionRationale: 'These 3 careers represent different pathways - healthcare (helping others), technology (problem-solving), and business (communication) - to help you explore your options.',
        nextSteps: [
          'Research each career option online',
          'Talk to people working in these fields',
          'Consider which type of work environment appeals to you most'
        ],
        parentSummary: this.generateDynamicParentSummary([
          { career: { title: 'Healthcare Professional', sector: 'healthcare' } },
          { career: { title: 'Technology Specialist', sector: 'technology' } },
          { career: { title: 'Business Professional', sector: 'business' } }
        ], parseInt(grade), zipCode),
        counselorNotes: this.generateDynamicCounselorNotes([
          { career: { title: 'Healthcare Professional', sector: 'healthcare' } },
          { career: { title: 'Technology Specialist', sector: 'technology' } },
          { career: { title: 'Business Professional', sector: 'business' } }
        ], parseInt(grade), {}),
        careerRoadmap: this.generateDynamicCareerRoadmap(parseInt(grade), [
          { career: { title: 'Healthcare Professional', sector: 'healthcare' } },
          { career: { title: 'Technology Specialist', sector: 'technology' } },
          { career: { title: 'Business Professional', sector: 'business' } }
        ]),
        // DO NOT include aiRecommendations in fallback - this causes frontend to think AI was used
        undecidedPath: true,
        fallbackMode: true,
        rawAIResponse: aiResponse,
        parseError: parseError instanceof Error ? parseError.message : String(parseError)
      };
    }
  }

  /**
   * Generate dynamic career roadmap based on student's grade and career matches
   */
  private static generateDynamicCareerRoadmap(currentGrade: number, careerMatches: any[]): CareerRoadmap {
    const remainingGrades = [];
    for (let grade = currentGrade; grade <= 12; grade++) {
      remainingGrades.push(grade);
    }

    // Extract career-specific courses based on top career matches
    const careerSpecificCourses = this.getCareerSpecificCourses(careerMatches);
    const academicPlan: any = {};

    remainingGrades.forEach((grade, index) => {
      const isCurrentGrade = grade === currentGrade;
      const isFinalYear = grade === 12;
      
      academicPlan[grade] = {
        coreCourses: this.getCoreCoursesForGrade(grade),
        electiveCourses: this.getElectiveCoursesForGrade(grade, careerMatches, isCurrentGrade),
        extracurriculars: this.getExtracurricularsForGrade(grade, careerMatches, isCurrentGrade),
        summerActivities: this.getSummerActivitiesForGrade(grade, careerMatches),
        milestones: this.getMilestonesForGrade(grade, careerMatches, isFinalYear)
      };
    });

    return {
      currentGrade,
      academicPlan,
      careerPreparation: {
        skillsToDevelope: this.getSkillsToDevelope(careerMatches),
        experienceOpportunities: this.getExperienceOpportunities(careerMatches, currentGrade),
        networkingSteps: this.getNetworkingSteps(careerMatches, currentGrade)
      },
      postGraduationPath: {
        immediateSteps: this.getImmediateSteps(careerMatches),
        educationOptions: this.getEducationOptions(careerMatches),
        careerEntry: {
          targetPositions: careerMatches.map(match => `Entry-level ${match.career.title}`),
          expectedSalary: this.getExpectedSalaryRange(careerMatches),
          advancement: this.getAdvancementPath(careerMatches)
        }
      }
    };
  }

  /**
   * Generate dynamic parent summary based on career matches and student grade
   */
  private static generateDynamicParentSummary(careerMatches: any[], grade: number, zipCode: string): any {
    const topCareer = careerMatches[0];
    const careerTitles = careerMatches.map(match => match.career.title).join(', ');
    const sectors = [...new Set(careerMatches.map(match => match.career.sector))];
    
    return {
      overview: `Your child shows strong potential in ${sectors.join(' and ')} fields. Based on their assessment, we recommend focusing on ${careerTitles} as primary career paths to explore during their remaining high school years.`,
      keyRecommendations: this.getParentKeyRecommendations(grade, careerMatches),
      supportActions: this.getParentSupportActions(grade, careerMatches),
      timelineHighlights: this.getParentTimelineHighlights(grade, careerMatches)
    };
  }

  /**
   * Generate dynamic counselor notes based on career matches and responses
   */
  private static generateDynamicCounselorNotes(careerMatches: any[], grade: number, responses: any): any {
    const topCareer = careerMatches[0];
    const careerTitles = careerMatches.map(match => match.career.title);
    const assessmentInsights = this.getAssessmentInsights(responses);
    
    return {
      assessmentInsights,
      recommendationRationale: [
        `Student shows alignment with ${careerTitles.join(', ')} based on their interests and strengths`,
        `Grade ${grade} timing allows for ${12 - grade + 1} years of focused preparation`,
        'Career matches span different sectors to provide exploration options'
      ],
      followUpActions: [
        'Schedule career exploration activities',
        'Connect with professionals in recommended fields',
        'Monitor academic progress in relevant subjects',
        'Plan summer experiences related to career interests'
      ],
      parentMeetingTopics: [
        'Review career exploration timeline',
        'Discuss post-secondary education options',
        'Plan family support for career development',
        'Address any concerns about career choices'
      ]
    };
  }

  // Helper methods for dynamic content generation
  private static getCareerSpecificCourses(careerMatches: any[]): string[] {
    const courseMapping: { [key: string]: string[] } = {
      'healthcare': ['Biology', 'Chemistry', 'Anatomy & Physiology', 'Health Sciences', 'Psychology'],
      'technology': ['Computer Science', 'Programming', 'Web Design', 'Digital Media', 'Statistics'],
      'business': ['Business Management', 'Economics', 'Accounting', 'Marketing', 'Public Speaking'],
      'education': ['Psychology', 'Child Development', 'Public Speaking', 'Education Theory'],
      'infrastructure': ['Physics', 'Engineering', 'Technical Drawing', 'Construction Technology'],
      'creative': ['Art', 'Design', 'Digital Media', 'Photography', 'Creative Writing'],
      'science': ['Advanced Biology', 'Chemistry', 'Physics', 'Environmental Science', 'Research Methods']
    };

    const courses = new Set<string>();
    careerMatches.forEach(match => {
      const sector = match.career.sector || 'general';
      const sectorCourses = courseMapping[sector] || [];
      sectorCourses.forEach(course => courses.add(course));
    });

    return Array.from(courses);
  }

  private static getCoreCoursesForGrade(grade: number): string[] {
    const baseCourses = ['English', 'Mathematics', 'Science', 'Social Studies'];
    
    if (grade >= 11) {
      return [
        'English 11/12',
        'Advanced Mathematics (Algebra II/Pre-Calc)',
        'Advanced Science (Chemistry/Physics)',
        'U.S. History/Government'
      ];
    }
    
    return baseCourses;
  }

  private static getElectiveCoursesForGrade(grade: number, careerMatches: any[], isCurrentGrade: boolean): string[] {
    const careerCourses = this.getCareerSpecificCourses(careerMatches);
    
    if (isCurrentGrade) {
      return [
        ...careerCourses.slice(0, 2),
        'Career Exploration',
        'Study Skills'
      ];
    }
    
    return [
      ...careerCourses.slice(0, 3),
      'Advanced Placement courses in relevant subjects'
    ];
  }

  private static getExtracurricularsForGrade(grade: number, careerMatches: any[], isCurrentGrade: boolean): string[] {
    const activityMapping: { [key: string]: string[] } = {
      'healthcare': ['Health Occupations Students of America (HOSA)', 'Volunteer at local hospital', 'Red Cross Club'],
      'technology': ['Computer Science Club', 'Robotics Team', 'Coding Bootcamp', 'Tech Support Volunteer'],
      'business': ['DECA', 'Future Business Leaders of America', 'Student Government', 'Entrepreneurship Club'],
      'education': ['Tutoring Program', 'Peer Mentoring', 'Education Club', 'Volunteer at elementary schools'],
      'infrastructure': ['Engineering Club', 'Construction Technology Club', 'Habitat for Humanity'],
      'creative': ['Art Club', 'Drama Club', 'Photography Club', 'Creative Writing Club'],
      'science': ['Science Olympiad', 'Environmental Club', 'Research Projects', 'Science Fair']
    };

    const activities = new Set<string>();
    careerMatches.forEach(match => {
      const sector = match.career.sector || 'general';
      const sectorActivities = activityMapping[sector] || ['Career-related clubs'];
      sectorActivities.slice(0, 2).forEach(activity => activities.add(activity));
    });

    if (grade >= 11) {
      activities.add('Leadership roles in chosen activities');
    }

    return Array.from(activities);
  }

  private static getSummerActivitiesForGrade(grade: number, careerMatches: any[]): string[] {
    const activities = [];
    
    if (grade === 11) {
      activities.push('Job shadowing in your top career choices');
      activities.push('Summer internship or volunteer work');
      activities.push('College campus visits');
    } else if (grade === 12) {
      activities.push('Summer job in related field');
      activities.push('College preparation courses');
      activities.push('Scholarship applications');
    } else {
      activities.push('Career exploration activities');
      activities.push('Skill-building workshops');
    }

    // Add career-specific summer activities
    const topCareer = careerMatches[0];
    if (topCareer) {
      const sector = topCareer.career.sector;
      if (sector === 'healthcare') {
        activities.push('Volunteer at healthcare facilities');
      } else if (sector === 'technology') {
        activities.push('Coding bootcamp or tech workshops');
      } else if (sector === 'business') {
        activities.push('Business internship or entrepreneurship program');
      }
    }

    return activities;
  }

  private static getMilestonesForGrade(grade: number, careerMatches: any[], isFinalYear: boolean): string[] {
    const milestones = [];
    
    if (isFinalYear) {
      milestones.push('Complete college applications');
      milestones.push('Apply for scholarships and financial aid');
      milestones.push('Make final career path decision');
    } else if (grade === 11) {
      milestones.push('Take SAT/ACT tests');
      milestones.push('Complete career exploration activities');
      milestones.push('Begin college research');
    } else {
      milestones.push('Maintain strong GPA');
      milestones.push('Explore career interests through activities');
      milestones.push('Build relevant skills and experience');
    }

    return milestones;
  }

  private static getSkillsToDevelope(careerMatches: any[]): Array<{skill: string; howToAcquire: string; timeline: string}> {
    const skills: Array<{skill: string; howToAcquire: string; timeline: string}> = [];
    
    // Add skills based on career matches
    careerMatches.forEach(match => {
      const sector = match.career.sector;
      if (sector === 'healthcare') {
        skills.push({
          skill: 'Medical Knowledge',
          howToAcquire: 'Take biology, chemistry, and health science courses',
          timeline: 'Throughout high school'
        });
      } else if (sector === 'technology') {
        skills.push({
          skill: 'Programming',
          howToAcquire: 'Take computer science courses, online coding bootcamps',
          timeline: 'Start immediately'
        });
      } else if (sector === 'business') {
        skills.push({
          skill: 'Business Communication',
          howToAcquire: 'Join DECA, take business courses, practice presentations',
          timeline: 'Throughout high school'
        });
      }
    });

    return skills;
  }

  private static getExperienceOpportunities(careerMatches: any[], currentGrade: number): Array<{activity: string; when: string; benefit: string}> {
    const opportunities: Array<{activity: string; when: string; benefit: string}> = [];
    
    careerMatches.forEach(match => {
      const sector = match.career.sector;
      if (currentGrade <= 11) {
        opportunities.push({
          activity: `Job shadowing in ${sector}`,
          when: 'Junior year',
          benefit: `Real-world exposure to ${match.career.title} work environment`
        });
      }
    });

    return opportunities;
  }

  private static getNetworkingSteps(careerMatches: any[], currentGrade: number): any[] {
    return [
      {
        action: 'Connect with professionals in your top career fields',
        timeline: 'Junior year',
        purpose: 'Learn about career paths and opportunities'
      },
      {
        action: 'Join student organizations related to career interests',
        timeline: 'Throughout high school',
        purpose: 'Meet like-minded peers and mentors'
      }
    ];
  }

  private static getImmediateSteps(careerMatches: any[]): string[] {
    return [
      'Complete high school with strong academic performance',
      'Apply to appropriate post-secondary programs',
      'Secure funding for chosen education path',
      'Gain relevant work experience through internships or part-time jobs'
    ];
  }

  private static getEducationOptions(careerMatches: any[]): any[] {
    const options = [
      {
        option: 'Community College',
        duration: '2 years',
        cost: '$6,000-12,000',
        location: 'Local options available'
      },
      {
        option: 'Four-year University',
        duration: '4 years',
        cost: '$20,000-50,000',
        location: 'In-state and out-of-state options'
      }
    ];

    // Add career-specific options
    careerMatches.forEach(match => {
      const sector = match.career.sector;
      if (sector === 'technology' || sector === 'infrastructure') {
        options.push({
          option: 'Trade/Technical School',
          duration: '6 months - 2 years',
          cost: '$5,000-20,000',
          location: 'Regional programs'
        });
      }
    });

    return options;
  }

  private static getExpectedSalaryRange(careerMatches: any[]): string {
    const salaries = careerMatches.map(match => match.career.averageSalary || 45000);
    const minSalary = Math.min(...salaries);
    const maxSalary = Math.max(...salaries);
    return `$${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`;
  }

  private static getAdvancementPath(careerMatches: any[]): string[] {
    return [
      'Gain experience in entry-level positions',
      'Pursue additional certifications or training',
      'Advance to specialized or management roles',
      'Consider entrepreneurship opportunities'
    ];
  }

  private static getParentKeyRecommendations(grade: number, careerMatches: any[]): string[] {
    const recommendations = [];
    
    if (grade <= 10) {
      recommendations.push('Focus on building strong academic foundation');
      recommendations.push('Encourage exploration of career-related activities');
    } else if (grade === 11) {
      recommendations.push('Support college and career planning activities');
      recommendations.push('Help arrange job shadowing opportunities');
    } else {
      recommendations.push('Assist with college applications and financial planning');
      recommendations.push('Support final career decision-making process');
    }

    return recommendations;
  }

  private static getParentSupportActions(grade: number, careerMatches: any[]): string[] {
    return [
      'Discuss career options regularly with your child',
      'Support participation in relevant extracurricular activities',
      'Help research post-secondary education options',
      'Connect with professionals in fields of interest'
    ];
  }

  private static getParentTimelineHighlights(grade: number, careerMatches: any[]): string[] {
    const highlights = [];
    
    if (grade === 9) {
      highlights.push('Focus on academic foundation and career exploration');
    } else if (grade === 10) {
      highlights.push('Begin narrowing career interests and taking relevant courses');
    } else if (grade === 11) {
      highlights.push('Intensive career exploration and college preparation');
    } else {
      highlights.push('Final preparations for post-secondary transition');
    }

    return highlights;
  }

  private static getAssessmentInsights(responses: any): string[] {
    const insights = [];
    
    // Add insights based on responses
    if (responses.workEnvironment) {
      insights.push(`Prefers ${responses.workEnvironment} work environment`);
    }
    if (responses.helpingOthers) {
      insights.push(`Shows interest in helping others: ${responses.helpingOthers}`);
    }
    if (responses.problemSolving) {
      insights.push(`Problem-solving approach: ${responses.problemSolving}`);
    }

    return insights;
  }

  /**
   * Generate counselor recommendations for decided students (with AI)
   * This is for students who have a clear career direction
   */
  static async generateDirectCounselorRecommendations(responses: any): Promise<any> {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 DIRECT COUNSELOR RECOMMENDATIONS - START');
    console.log('='.repeat(80));
    console.log('📊 Generating recommendations for decided student...');
    
    const grade = responses.basic_info?.grade || responses.grade || 11;
    const zipCode = responses.basic_info?.zipCode || responses.zipCode || '12345';
    
    console.log(`👤 Student: Grade ${grade}, ZIP ${zipCode}`);
    console.log('📊 Total response keys:', Object.keys(responses).length);

    try {
      // Create AI prompt for decided students
      const decidedPrompt = `ROLE:
You are a Senior Career Counselor AI specializing in high school career guidance and personalized pathway planning.

TASK:
Analyze this student's assessment responses and provide personalized career recommendations with detailed pathways. The student has completed a comprehensive career assessment.

CONTEXT:
- Platform: Lantern AI career guidance system for high school students
- Student: Grade ${grade} student in ZIP code ${zipCode}
- Assessment Type: Comprehensive career assessment
- Output Usage: Provide detailed career matches and action plans

STUDENT ASSESSMENT RESPONSES:
${Object.entries(responses)
  .filter(([key]) => !['grade', 'zipCode', 'basic_info'].includes(key))
  .map(([questionId, answer]) => {
    const cleanAnswer = typeof answer === 'object' ? JSON.stringify(answer) : answer;
    return `${questionId}: ${cleanAnswer}`;
  })
  .join('\n')}

OUTPUT REQUIREMENTS:
Generate a structured JSON response with 5-8 career matches:

{
  "careerMatches": [
    {
      "careerTitle": "Specific career title",
      "sector": "healthcare/technology/infrastructure/business/education/etc",
      "matchPercentage": 85,
      "whyThisCareer": "Detailed explanation",
      "averageSalary": 65000,
      "requiredEducation": "Specific education requirement",
      "localJobMarket": {
        "estimatedJobs": 45,
        "averageLocalSalary": 62000,
        "topEmployers": ["Employer 1", "Employer 2"],
        "growthOutlook": "Growing/Stable/Declining"
      },
      "skillsNeeded": ["Skill 1", "Skill 2", "Skill 3"],
      "highSchoolPrep": ["Course 1", "Course 2"]
    }
  ],
  "careerPathway": {
    "steps": ["Step 1", "Step 2", "Step 3"],
    "timeline": "4-6 years",
    "requirements": ["Requirement 1", "Requirement 2"]
  },
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "Critical/Important/Helpful",
      "howToAcquire": "How to develop this skill"
    }
  ],
  "nextSteps": ["Action 1", "Action 2", "Action 3"]
}

CRITICAL: Return ONLY the JSON object. No additional text.`;

      console.log('\n📤 CALLING AI SERVICE...');
      console.log('   - Prompt length:', decidedPrompt.length, 'characters');
      
      const aiResponse = await CleanAIRecommendationService.callAI(decidedPrompt);
      
      console.log('✅ AI RESPONSE RECEIVED');
      console.log('   - Response length:', aiResponse?.length || 0, 'characters');
      
      // Parse AI response
      console.log('\n🔍 PARSING AI RESPONSE...');
      const parsedResponse = this.parseDecidedAIResponse(aiResponse, grade, zipCode);
      
      console.log('✅ Direct counselor recommendations completed');
      console.log('📊 Result summary:');
      console.log('   - Career matches:', parsedResponse.topJobMatches?.length || 0);
      console.log('   - Has aiRecommendations:', !!parsedResponse.aiRecommendations);
      console.log('   - aiProcessed flag:', parsedResponse.aiRecommendations?.aiProcessed);
      console.log('='.repeat(80));
      console.log('🎯 DIRECT COUNSELOR RECOMMENDATIONS - SUCCESS');
      console.log('='.repeat(80) + '\n');
      
      return parsedResponse;

    } catch (error) {
      console.error('\n' + '='.repeat(80));
      console.error('❌ DIRECT COUNSELOR RECOMMENDATIONS - FAILED');
      console.error('='.repeat(80));
      console.error('❌ Error details:', error);
      console.error('   - Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('   - Error message:', error instanceof Error ? error.message : String(error));
      console.error('='.repeat(80) + '\n');
      
      // Return basic fallback
      console.log('🔄 USING BASIC FALLBACK (no AI)...');
      return this.generateBasicFallback(grade, zipCode);
    }
  }

  /**
   * Parse AI response for decided students
   */
  private static parseDecidedAIResponse(aiResponse: string, grade: string, zipCode: string): any {
    try {
      let cleanResponse = aiResponse.trim();
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      const careerMatches = (parsed.careerMatches || []).map((match: any, index: number) => ({
        career: {
          id: match.careerTitle?.toLowerCase().replace(/\s+/g, '-') || `career-${index + 1}`,
          title: match.careerTitle || `Career Option ${index + 1}`,
          description: match.whyThisCareer || 'AI-generated career match',
          sector: match.sector || 'general',
          averageSalary: match.averageSalary || 50000,
          requiredEducation: match.requiredEducation || 'High school diploma',
          certifications: [],
          growthOutlook: match.localJobMarket?.growthOutlook || 'Stable'
        },
        matchScore: match.matchPercentage || 75,
        matchReasons: [match.whyThisCareer || 'Based on your assessment'],
        localOpportunities: {
          estimatedJobs: match.localJobMarket?.estimatedJobs || 25,
          averageLocalSalary: match.localJobMarket?.averageLocalSalary || match.averageSalary || 50000,
          topEmployers: Array.isArray(match.localJobMarket?.topEmployers) ? match.localJobMarket.topEmployers : ['Local employers'],
          distanceFromStudent: 15
        },
        educationPath: {
          highSchoolCourses: Array.isArray(match.highSchoolPrep) ? match.highSchoolPrep : ['Core courses'],
          postSecondaryOptions: [match.requiredEducation || 'Post-secondary education'],
          timeToCareer: '2-4 years',
          estimatedCost: 25000
        }
      }));

      return {
        studentProfile: {
          grade: parseInt(grade),
          location: zipCode,
          careerReadiness: 'Developing'
        },
        topJobMatches: careerMatches,
        parentSummary: this.generateDynamicParentSummary(careerMatches, parseInt(grade), zipCode),
        counselorNotes: this.generateDynamicCounselorNotes(careerMatches, parseInt(grade), {}),
        careerRoadmap: this.generateDynamicCareerRoadmap(parseInt(grade), careerMatches),
        aiRecommendations: {
          academicPlan: parsed.careerPathway || {},
          localJobs: [],
          careerPathway: parsed.careerPathway || {},
          skillGaps: parsed.skillGaps || [],
          actionItems: parsed.nextSteps || [],
          aiProcessed: true // Flag to indicate real AI was used
        }
      };
    } catch (parseError) {
      console.error('❌ Failed to parse decided AI response:', parseError);
      return this.generateBasicFallback(grade, zipCode);
    }
  }

  /**
   * Basic fallback when AI completely fails
   */
  private static generateBasicFallback(grade: string, zipCode: string): any {
    return {
      studentProfile: {
        grade: parseInt(grade),
        location: zipCode,
        strengths: ['Academic performance', 'Communication skills'],
        interests: ['Career exploration'],
        careerReadiness: 'Developing'
      },
      topJobMatches: [
        {
          career: {
            id: 'general-career',
            title: 'General Career Path',
            description: 'Explore various career options based on your interests',
            sector: 'general',
            averageSalary: 45000,
            requiredEducation: 'High school diploma'
          },
          matchScore: 75,
          matchReasons: ['Based on your assessment responses'],
          localOpportunities: {
            estimatedJobs: 50,
            averageLocalSalary: 45000,
            topEmployers: ['Local Companies'],
            distanceFromStudent: 15
          },
          educationPath: {
            highSchoolCourses: ['Core academic subjects'],
            postSecondaryOptions: ['Various education paths'],
            timeToCareer: '1-4 years',
            estimatedCost: 20000
          }
        }
      ],
      careerRoadmap: this.generateDynamicCareerRoadmap(parseInt(grade), [
        { career: { title: 'General Career Path', sector: 'general' } }
      ]),
      // DO NOT include aiRecommendations in fallback - this causes frontend to think AI was used
      parentSummary: {
        overview: 'Your child is exploring various career options.',
        keyRecommendations: ['Support career exploration', 'Maintain strong academics'],
        supportActions: ['Encourage participation in activities', 'Discuss career interests'],
        timelineHighlights: ['Focus on exploration and preparation']
      },
      counselorNotes: {
        assessmentInsights: ['Student is exploring career options'],
        recommendationRationale: ['Providing general guidance for career exploration'],
        followUpActions: ['Continue career exploration', 'Monitor academic progress'],
        parentMeetingTopics: ['Discuss career interests', 'Plan next steps']
      },
      fallbackMode: true // Flag to indicate this is fallback, not real AI
    };
  }
}