import { CareerService } from './careerService';
import { CareerMatch, AssessmentAnswer } from '../types';
import { CleanAIRecommendationService } from './cleanAIRecommendationService';
import { DynamicSalaryService } from './dynamicSalaryService';
import { EnhancedCareerService } from './enhancedCareerService';
import { CareerMatchingService, EnhancedCareerMatch } from './careerMatchingService';
import { CareerRoadmapService, CareerRoadmapInput } from './careerRoadmapService';

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
      aiGuidance?: string[];
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
  aiEnhanced?: boolean;
  aiTimeline?: string;
}

export interface CounselorRecommendation {
  studentProfile: {
    grade: number;
    location: string;
    strengths: string[];
    interests: string[];
    careerReadiness: string;
    courseHistory?: { [subject: string]: string };
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
4. ACADEMIC PREPARATION: Consider any AP, Honors, or specialized courses the student has taken to assess their academic readiness and interests
5. REALISTIC PATHWAYS: Consider student's education commitment and support system
6. LOCAL RELEVANCE: Factor in ZIP code ${zipCode} job market opportunities - provide REAL employer names that hire for these careers in or near this ZIP code
7. GROWTH POTENTIAL: Include careers with good advancement opportunities for young professionals
8. EMPLOYER SPECIFICITY: Research and provide actual company/organization names that hire for each career in the ZIP ${zipCode} area (e.g., specific hospitals, tech companies, school districts, construction firms, etc.)
9. EMPLOYER REALISM: Suggest employers that would realistically appear in job search results (like Adzuna, Indeed, LinkedIn) for this career and location - use actual company names, not generic placeholders

OUTPUT REQUIREMENTS:
Generate a structured JSON response with exactly 3 career matches.
IMPORTANT: For topEmployers, provide actual company/organization names that hire for each career in the ZIP ${zipCode} area. Research real employers that would appear in job search platforms like Adzuna, Indeed, or LinkedIn - do NOT use generic placeholders like "Local employer 1". Examples: "Memorial Hospital", "Amazon Fulfillment Center", "Starbucks", "Target", "Local School District", etc.

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
        "topEmployers": ["Specific local employer name 1", "Specific local employer name 2", "Specific local employer name 3"],
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
      const parsedResponse = this.parseUndecidedAIResponse(aiResponse, grade, zipCode, responses);
      
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
  private static parseUndecidedAIResponse(aiResponse: string, grade: string, zipCode: string, responses: any): any {
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
          pathType: 'undecided',
          courseHistory: this.extractCourseHistory(responses)
        },
        topJobMatches: careerMatches,
        selectionRationale: parsed.selectionRationale || 'These careers were selected based on your interests and assessment responses',
        nextSteps: ensureArray(parsed.nextSteps, [
          'Research each career option in detail',
          'Talk to professionals in these fields',
          'Consider job shadowing opportunities'
        ]),
        parentSummary: this.generateDynamicParentSummary(careerMatches, parseInt(grade), zipCode, parsed),
        counselorNotes: this.generateDynamicCounselorNotes(careerMatches, parseInt(grade), {}, parsed),
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
          pathType: 'undecided',
          courseHistory: this.extractCourseHistory(responses)
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
        ], parseInt(grade), zipCode, undefined),
        counselorNotes: this.generateDynamicCounselorNotes([
          { career: { title: 'Healthcare Professional', sector: 'healthcare' } },
          { career: { title: 'Technology Specialist', sector: 'technology' } },
          { career: { title: 'Business Professional', sector: 'business' } }
        ], parseInt(grade), {}, undefined),
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
   * Now enhanced with AI-generated pathway integration
   */
  private static generateDynamicCareerRoadmap(currentGrade: number, careerMatches: any[], aiCareerPathway?: any): CareerRoadmap {
    const remainingGrades = [];
    for (let grade = currentGrade; grade <= 12; grade++) {
      remainingGrades.push(grade);
    }

    // Extract career-specific courses based on top career matches
    const careerSpecificCourses = this.getCareerSpecificCourses(careerMatches);
    const academicPlan: any = {};

    // If AI provided a pathway, integrate it into the academic plan
    const aiSteps = aiCareerPathway?.steps || [];
    const aiTimeline = aiCareerPathway?.timeline || '';
    const aiRequirements = aiCareerPathway?.requirements || [];

    remainingGrades.forEach((grade, index) => {
      const isCurrentGrade = grade === currentGrade;
      const isFinalYear = grade === 12;
      
      // Get AI-specific recommendations for this grade if available
      const gradeSpecificAISteps = aiSteps.filter((step: string) => 
        step.toLowerCase().includes(`grade ${grade}`) || 
        step.toLowerCase().includes(`${grade}th grade`) ||
        (isCurrentGrade && (step.toLowerCase().includes('current') || step.toLowerCase().includes('now') || step.toLowerCase().includes('immediately')))
      );
      
      academicPlan[grade] = {
        coreCourses: this.getCoreCoursesForGrade(grade),
        electiveCourses: this.getElectiveCoursesForGrade(grade, careerMatches, isCurrentGrade, aiRequirements),
        extracurriculars: this.getExtracurricularsForGrade(grade, careerMatches, isCurrentGrade),
        summerActivities: this.getSummerActivitiesForGrade(grade, careerMatches, aiSteps),
        milestones: this.getMilestonesForGrade(grade, careerMatches, isFinalYear, gradeSpecificAISteps),
        aiGuidance: gradeSpecificAISteps.length > 0 ? gradeSpecificAISteps : undefined
      };
    });

    return {
      currentGrade,
      academicPlan,
      careerPreparation: {
        skillsToDevelope: this.getSkillsToDevelope(careerMatches, aiRequirements),
        experienceOpportunities: this.getExperienceOpportunities(careerMatches, currentGrade, aiSteps),
        networkingSteps: this.getNetworkingSteps(careerMatches, currentGrade)
      },
      postGraduationPath: {
        immediateSteps: this.getImmediateSteps(careerMatches, aiSteps),
        educationOptions: this.getEducationOptions(careerMatches, aiRequirements),
        careerEntry: {
          targetPositions: careerMatches.map(match => `Entry-level ${match.career.title}`),
          expectedSalary: this.getExpectedSalaryRange(careerMatches),
          advancement: this.getAdvancementPath(careerMatches)
        }
      },
      aiEnhanced: !!aiCareerPathway,
      aiTimeline: aiTimeline || undefined
    };
  }

  /**
   * Generate dynamic parent summary based on career matches and student grade
   */
  private static generateDynamicParentSummary(careerMatches: any[], grade: number, zipCode: string, aiRecommendations?: any): any {
    const topCareer = careerMatches[0];
    const careerTitles = careerMatches.slice(0, 3).map(match => match.career.title).join(', ');
    const sectors = [...new Set(careerMatches.map(match => match.career.sector))];
    const remainingYears = 12 - grade + 1;
    
    // Calculate average salary for context
    const avgSalary = Math.round(
      careerMatches.reduce((sum, match) => sum + (match.localOpportunities?.averageLocalSalary || match.career?.averageSalary || 50000), 0) / careerMatches.length
    );
    
    // Get education requirements
    const educationLevels = [...new Set(careerMatches.map(match => match.career.requiredEducation))];
    const primaryEducation = educationLevels[0] || 'post-secondary education';
    
    // Build personalized overview
    let overview = `Your child has completed a comprehensive career assessment and shows strong alignment with careers in ${sectors.join(', ')} fields. `;
    
    if (careerMatches.length === 3) {
      overview += `We've identified three focused career options to help them explore: ${careerTitles}. `;
    } else {
      overview += `Their top career matches include ${careerTitles}. `;
    }
    
    overview += `These careers offer an average local salary of $${avgSalary.toLocaleString()} and typically require ${primaryEducation}. `;
    overview += `With ${remainingYears} year${remainingYears > 1 ? 's' : ''} remaining in high school, there is excellent time to prepare for ${remainingYears > 2 ? 'these pathways' : 'this transition'}.`;
    
    return {
      overview,
      keyRecommendations: this.getParentKeyRecommendations(grade, careerMatches, topCareer, aiRecommendations),
      supportActions: this.getParentSupportActions(grade, careerMatches, topCareer),
      timelineHighlights: this.getParentTimelineHighlights(grade, careerMatches, topCareer)
    };
  }

  /**
   * Generate dynamic counselor notes based on career matches and responses
   */
  private static generateDynamicCounselorNotes(careerMatches: any[], grade: number, responses: any, aiRecommendations?: any): any {
    const topCareer = careerMatches[0];
    const careerTitles = careerMatches.slice(0, 3).map(match => match.career.title);
    const assessmentInsights = this.getAssessmentInsights(responses, careerMatches);
    const remainingYears = 12 - grade + 1;
    
    // Build detailed recommendation rationale
    const recommendationRationale = [];
    
    // Add career-specific rationale
    if (topCareer) {
      const matchScore = topCareer.matchScore || 75;
      recommendationRationale.push(
        `Primary recommendation: ${topCareer.career.title} (${matchScore}% match) in ${topCareer.career.sector} sector`
      );
      
      if (topCareer.matchReasons && topCareer.matchReasons.length > 0) {
        recommendationRationale.push(
          `Match reasoning: ${topCareer.matchReasons[0]}`
        );
      }
    }
    
    // Add timing and preparation context
    recommendationRationale.push(
      `Student is in grade ${grade} with ${remainingYears} year${remainingYears > 1 ? 's' : ''} remaining for focused career preparation`
    );
    
    // Add education pathway context
    const educationRequired = topCareer?.career?.requiredEducation || 'post-secondary education';
    recommendationRationale.push(
      `Education pathway: ${educationRequired} - timeline allows for adequate preparation`
    );
    
    // Add AI-specific insights if available
    if (aiRecommendations?.careerPathway?.timeline) {
      recommendationRationale.push(
        `AI-generated timeline: ${aiRecommendations.careerPathway.timeline}`
      );
    }
    
    // Build career-specific follow-up actions
    const followUpActions = this.getCounselorFollowUpActions(grade, careerMatches, topCareer, aiRecommendations);
    
    // Build personalized parent meeting topics
    const parentMeetingTopics = this.getParentMeetingTopics(grade, careerMatches, topCareer);
    
    return {
      assessmentInsights,
      recommendationRationale,
      followUpActions,
      parentMeetingTopics
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
    // Grade-specific core course progression
    switch (grade) {
      case 9:
        return [
          'English 9',
          'Algebra I / Geometry',
          'Biology',
          'World History'
        ];
      case 10:
        return [
          'English 10',
          'Geometry / Algebra II',
          'Chemistry',
          'World Geography / Civics'
        ];
      case 11:
        return [
          'English 11 (American Literature)',
          'Algebra II / Pre-Calculus',
          'Physics / Advanced Science',
          'U.S. History'
        ];
      case 12:
        return [
          'English 12 (British Literature / Composition)',
          'Pre-Calculus / Calculus / Statistics',
          'Advanced Science (AP/Honors)',
          'Government / Economics'
        ];
      default:
        return [
          'English',
          'Mathematics',
          'Science',
          'Social Studies'
        ];
    }
  }

  private static getElectiveCoursesForGrade(grade: number, careerMatches: any[], isCurrentGrade: boolean, aiRequirements?: string[]): string[] {
    const careerCourses = this.getCareerSpecificCourses(careerMatches);
    const courses: string[] = [];
    
    // Add AI-recommended requirements if available
    const aiCourses = aiRequirements?.filter(req => 
      req.toLowerCase().includes('course') || 
      req.toLowerCase().includes('class') ||
      req.toLowerCase().includes('study')
    ) || [];
    
    // Grade-specific course progression
    if (grade === 9) {
      // 9th grade: Introductory courses
      courses.push(...careerCourses.slice(0, 2).map(c => `Introduction to ${c}`));
      courses.push('Career Exploration');
      courses.push('Study Skills');
    } else if (grade === 10) {
      // 10th grade: Foundational courses
      courses.push(...careerCourses.slice(0, 2));
      if (aiCourses.length > 0) courses.push(aiCourses[0]);
      courses.push('Career Development');
    } else if (grade === 11) {
      // 11th grade: Advanced courses
      courses.push(...careerCourses.slice(2, 4).map(c => `Advanced ${c}`));
      if (aiCourses.length > 1) courses.push(aiCourses[1]);
      courses.push('AP/Honors courses in relevant subjects');
    } else if (grade === 12) {
      // 12th grade: College-level and specialized courses
      courses.push(...careerCourses.slice(4, 6).map(c => `College-level ${c}`));
      if (aiCourses.length > 2) courses.push(aiCourses[2]);
      courses.push('Dual Enrollment opportunities');
      courses.push('Career Internship/Practicum');
    }
    
    return courses.filter(Boolean);
  }

  private static getExtracurricularsForGrade(grade: number, careerMatches: any[], isCurrentGrade: boolean): string[] {
    const activityMapping: { [key: string]: { [gradeLevel: string]: string[] } } = {
      'healthcare': {
        'early': ['Health Occupations Students of America (HOSA)', 'Red Cross Club', 'First Aid Training'],
        'advanced': ['Hospital Volunteer Program', 'Medical Shadowing', 'HOSA Leadership Roles']
      },
      'technology': {
        'early': ['Computer Science Club', 'Coding Basics', 'Tech Support Volunteer'],
        'advanced': ['Robotics Team Captain', 'Hackathons', 'App Development Projects']
      },
      'business': {
        'early': ['DECA', 'Future Business Leaders of America', 'Student Government'],
        'advanced': ['DECA Competition Team', 'Entrepreneurship Club President', 'Business Internship']
      },
      'education': {
        'early': ['Tutoring Program', 'Peer Mentoring', 'Education Club'],
        'advanced': ['Lead Tutor', 'Teaching Assistant', 'Elementary School Volunteer Coordinator']
      },
      'infrastructure': {
        'early': ['Engineering Club', 'Construction Technology Club', 'Habitat for Humanity'],
        'advanced': ['Engineering Competition Team', 'Project Lead', 'Technical Design Projects']
      },
      'creative': {
        'early': ['Art Club', 'Drama Club', 'Photography Club'],
        'advanced': ['Art Show Organizer', 'Lead Role in Productions', 'Portfolio Development']
      },
      'science': {
        'early': ['Science Olympiad', 'Environmental Club', 'Science Fair'],
        'advanced': ['Science Olympiad Captain', 'Research Projects', 'Science Fair Awards']
      }
    };

    const activities = new Set<string>();
    const level = grade >= 11 ? 'advanced' : 'early';
    
    careerMatches.forEach(match => {
      const sector = match.career.sector || 'general';
      const sectorActivities = activityMapping[sector]?.[level] || ['Career-related clubs'];
      sectorActivities.slice(0, 2).forEach(activity => activities.add(activity));
    });

    if (grade >= 11) {
      activities.add('Leadership roles in chosen activities');
    }

    return Array.from(activities);
  }

  private static getSummerActivitiesForGrade(grade: number, careerMatches: any[], aiSteps?: string[]): string[] {
    const activities = [];
    
    // Add AI-specific summer recommendations
    const aiSummerSteps = aiSteps?.filter(step => 
      step.toLowerCase().includes('summer') ||
      step.toLowerCase().includes('internship') ||
      step.toLowerCase().includes('volunteer')
    ) || [];
    
    if (aiSummerSteps.length > 0) {
      activities.push(...aiSummerSteps.slice(0, 2));
    }
    
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

  private static getMilestonesForGrade(grade: number, careerMatches: any[], isFinalYear: boolean, aiGuidance?: string[]): string[] {
    const milestones = [];
    
    // Add AI-specific milestones first
    if (aiGuidance && aiGuidance.length > 0) {
      milestones.push(...aiGuidance.slice(0, 2));
    }
    
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

  private static getSkillsToDevelope(careerMatches: any[], aiRequirements?: string[]): Array<{skill: string; howToAcquire: string; timeline: string}> {
    const skills: Array<{skill: string; howToAcquire: string; timeline: string}> = [];
    
    // Add AI-recommended skills first
    if (aiRequirements) {
      aiRequirements.slice(0, 3).forEach(req => {
        skills.push({
          skill: req,
          howToAcquire: 'Follow AI-recommended pathway',
          timeline: 'Throughout high school'
        });
      });
    }
    
    // Add skills based on career matches
    careerMatches.forEach(match => {
      const sector = match.career.sector;
      if (sector === 'healthcare' && skills.length < 5) {
        skills.push({
          skill: 'Medical Knowledge',
          howToAcquire: 'Take biology, chemistry, and health science courses',
          timeline: 'Throughout high school'
        });
      } else if (sector === 'technology' && skills.length < 5) {
        skills.push({
          skill: 'Programming',
          howToAcquire: 'Take computer science courses, online coding bootcamps',
          timeline: 'Start immediately'
        });
      } else if (sector === 'business' && skills.length < 5) {
        skills.push({
          skill: 'Business Communication',
          howToAcquire: 'Join DECA, take business courses, practice presentations',
          timeline: 'Throughout high school'
        });
      }
    });

    return skills;
  }

  private static getExperienceOpportunities(careerMatches: any[], currentGrade: number, aiSteps?: string[]): Array<{activity: string; when: string; benefit: string}> {
    const opportunities: Array<{activity: string; when: string; benefit: string}> = [];
    
    // Add AI-recommended experiences first
    if (aiSteps) {
      const experienceSteps = aiSteps.filter(step => 
        step.toLowerCase().includes('experience') ||
        step.toLowerCase().includes('internship') ||
        step.toLowerCase().includes('volunteer') ||
        step.toLowerCase().includes('shadow')
      );
      
      experienceSteps.slice(0, 2).forEach(step => {
        opportunities.push({
          activity: step,
          when: currentGrade <= 11 ? 'Junior year' : 'Senior year',
          benefit: 'AI-recommended career preparation'
        });
      });
    }
    
    careerMatches.forEach(match => {
      const sector = match.career.sector;
      if (currentGrade <= 11 && opportunities.length < 5) {
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

  private static getImmediateSteps(careerMatches: any[], aiSteps?: string[]): string[] {
    const steps = [];
    
    // Add AI immediate steps first
    if (aiSteps) {
      const immediateSteps = aiSteps.filter(step => 
        step.toLowerCase().includes('immediately') ||
        step.toLowerCase().includes('now') ||
        step.toLowerCase().includes('first') ||
        step.toLowerCase().includes('start')
      );
      steps.push(...immediateSteps.slice(0, 2));
    }
    
    steps.push(
      'Complete high school with strong academic performance',
      'Apply to appropriate post-secondary programs',
      'Secure funding for chosen education path',
      'Gain relevant work experience through internships or part-time jobs'
    );
    
    return steps;
  }

  private static getEducationOptions(careerMatches: any[], aiRequirements?: string[]): any[] {
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

    // Add AI-recommended education options
    if (aiRequirements) {
      aiRequirements.forEach(req => {
        if (req.toLowerCase().includes('bachelor') || req.toLowerCase().includes('university')) {
          // Already have university option
        } else if (req.toLowerCase().includes('certificate') || req.toLowerCase().includes('certification')) {
          options.push({
            option: 'Professional Certification',
            duration: '6 months - 1 year',
            cost: '$2,000-10,000',
            location: 'Online and local programs'
          });
        } else if (req.toLowerCase().includes('trade') || req.toLowerCase().includes('technical')) {
          options.push({
            option: 'Trade/Technical School',
            duration: '6 months - 2 years',
            cost: '$5,000-20,000',
            location: 'Regional programs'
          });
        }
      });
    }

    // Add career-specific options
    careerMatches.forEach(match => {
      const sector = match.career.sector;
      if ((sector === 'technology' || sector === 'infrastructure') && !options.find(o => o.option.includes('Trade'))) {
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

  private static getParentKeyRecommendations(grade: number, careerMatches: any[], topCareer: any, aiRecommendations?: any): string[] {
    const recommendations = [];
    const careerTitle = topCareer?.career?.title || 'their chosen career';
    const sector = topCareer?.career?.sector || 'their field of interest';
    const education = topCareer?.career?.requiredEducation || 'post-secondary education';
    
    // Grade-specific recommendations with career context
    if (grade <= 10) {
      recommendations.push(
        `Focus on building strong academic foundation, especially in subjects relevant to ${sector} careers`
      );
      recommendations.push(
        `Encourage exploration of ${sector}-related activities and clubs to build interest and experience`
      );
      recommendations.push(
        `Help your child research what a typical day looks like for a ${careerTitle}`
      );
    } else if (grade === 11) {
      recommendations.push(
        `Support college and career planning activities focused on ${education} programs for ${careerTitle}`
      );
      recommendations.push(
        `Help arrange job shadowing or informational interviews with professionals in ${sector}`
      );
      recommendations.push(
        `Begin researching specific colleges/programs that excel in preparing students for ${sector} careers`
      );
      if (aiRecommendations?.careerPathway?.requirements) {
        recommendations.push(
          `Key requirements to focus on: ${aiRecommendations.careerPathway.requirements.slice(0, 2).join(', ')}`
        );
      }
    } else {
      recommendations.push(
        `Assist with college applications, focusing on programs that lead to ${careerTitle} positions`
      );
      recommendations.push(
        `Support financial planning for ${education} - explore scholarships specific to ${sector}`
      );
      recommendations.push(
        `Help finalize career decision and ensure your child feels confident about their ${careerTitle} pathway`
      );
      recommendations.push(
        `Connect with ${sector} professionals who can provide mentorship during the transition to college`
      );
    }
    
    // Add salary context for financial planning
    const avgSalary = topCareer?.localOpportunities?.averageLocalSalary || topCareer?.career?.averageSalary;
    if (avgSalary) {
      recommendations.push(
        `Career outlook: ${careerTitle} positions in your area average $${avgSalary.toLocaleString()} annually`
      );
    }

    return recommendations;
  }

  private static getParentSupportActions(grade: number, careerMatches: any[], topCareer: any): string[] {
    const actions = [];
    const careerTitle = topCareer?.career?.title || 'their chosen career';
    const sector = topCareer?.career?.sector || 'their field';
    
    // Career-specific support actions
    actions.push(
      `Have regular conversations about ${careerTitle} and what excites your child about this path`
    );
    
    // Sector-specific activities
    if (sector === 'healthcare') {
      actions.push('Support participation in HOSA, volunteer work at healthcare facilities, or first aid training');
      actions.push('Help arrange hospital tours or meetings with healthcare professionals');
    } else if (sector === 'technology') {
      actions.push('Support participation in coding clubs, robotics teams, or technology competitions');
      actions.push('Provide access to online learning platforms for programming and tech skills');
    } else if (sector === 'business') {
      actions.push('Support participation in DECA, Future Business Leaders, or entrepreneurship programs');
      actions.push('Help identify local business internship or mentorship opportunities');
    } else if (sector === 'education') {
      actions.push('Support tutoring, mentoring, or teaching assistant opportunities');
      actions.push('Connect with teachers who can provide guidance on education careers');
    } else if (sector === 'infrastructure' || sector === 'engineering') {
      actions.push('Support participation in engineering clubs, robotics, or construction technology programs');
      actions.push('Help find opportunities to visit engineering firms or construction sites');
    } else {
      actions.push(`Support participation in ${sector}-related extracurricular activities and clubs`);
    }
    
    // Education planning support
    actions.push(
      `Research and visit colleges/programs that specialize in preparing students for ${careerTitle} careers`
    );
    
    // Networking support
    actions.push(
      `Use your professional network to connect your child with ${sector} professionals for informational interviews`
    );
    
    // Financial planning
    const avgSalary = topCareer?.localOpportunities?.averageLocalSalary || topCareer?.career?.averageSalary;
    if (avgSalary && avgSalary > 60000) {
      actions.push(
        `Plan for education investment - ${careerTitle} careers offer strong earning potential ($${avgSalary.toLocaleString()}+ locally)`
      );
    } else if (avgSalary) {
      actions.push(
        `Explore scholarship and financial aid options to make education affordable for ${careerTitle} pathway`
      );
    }

    return actions;
  }

  private static getParentTimelineHighlights(grade: number, careerMatches: any[], topCareer: any): string[] {
    const highlights = [];
    const careerTitle = topCareer?.career?.title || 'their chosen career';
    const sector = topCareer?.career?.sector || 'their field';
    const remainingYears = 12 - grade + 1;
    
    // Current year focus
    if (grade === 9) {
      highlights.push(
        `Grade 9 (Current): Build strong academic foundation, especially in subjects relevant to ${sector}`
      );
      highlights.push(
        `Explore ${sector} through introductory courses, clubs, and career research`
      );
      highlights.push(
        `Begin developing skills needed for ${careerTitle} through extracurriculars`
      );
    } else if (grade === 10) {
      highlights.push(
        `Grade 10 (Current): Take foundational courses in ${sector} and maintain strong GPA`
      );
      highlights.push(
        `Narrow career focus and increase involvement in ${sector}-related activities`
      );
      highlights.push(
        `Begin researching colleges and programs that lead to ${careerTitle} careers`
      );
    } else if (grade === 11) {
      highlights.push(
        `Grade 11 (Current): Intensive preparation - take advanced courses, pursue leadership roles`
      );
      highlights.push(
        `Arrange job shadowing or internships in ${sector} to gain real-world experience`
      );
      highlights.push(
        `Begin college applications focused on ${careerTitle} programs, take SAT/ACT`
      );
      highlights.push(
        `Research scholarships specific to ${sector} careers`
      );
    } else {
      highlights.push(
        `Grade 12 (Current): Finalize college applications for ${careerTitle} programs`
      );
      highlights.push(
        `Complete financial aid applications and scholarship submissions for ${sector} programs`
      );
      highlights.push(
        `Make final decision on college/program and prepare for transition to ${careerTitle} pathway`
      );
      highlights.push(
        `Consider summer internship or work experience in ${sector} before college`
      );
    }
    
    // Future years (if applicable)
    if (grade < 12) {
      const nextGrade = grade + 1;
      if (nextGrade === 10) {
        highlights.push(
          `Grade 10 (Next Year): Continue building ${sector} skills, take relevant electives`
        );
      } else if (nextGrade === 11) {
        highlights.push(
          `Grade 11 (Next Year): Advanced coursework, leadership roles, college research intensifies`
        );
      } else if (nextGrade === 12) {
        highlights.push(
          `Grade 12 (Next Year): College applications, financial planning, final preparations`
        );
      }
    }
    
    // Post-graduation timeline
    const education = topCareer?.career?.requiredEducation || 'post-secondary education';
    highlights.push(
      `After High School: Pursue ${education} to enter ${careerTitle} field`
    );

    return highlights;
  }

  private static getCounselorFollowUpActions(grade: number, careerMatches: any[], topCareer: any, aiRecommendations?: any): string[] {
    const actions = [];
    const careerTitle = topCareer?.career?.title || 'recommended career';
    const sector = topCareer?.career?.sector || 'career field';
    
    // Immediate actions based on grade
    if (grade <= 10) {
      actions.push(
        `Schedule career exploration session focused on ${sector} careers and ${careerTitle} specifically`
      );
      actions.push(
        `Connect student with ${sector} professionals for informational interviews or job shadowing`
      );
      actions.push(
        `Monitor academic progress in subjects critical for ${careerTitle} (especially math, science, and relevant electives)`
      );
    } else if (grade === 11) {
      actions.push(
        `Arrange internship or job shadowing experience in ${sector} before end of junior year`
      );
      actions.push(
        `Review and finalize college list focusing on strong ${careerTitle} programs`
      );
      actions.push(
        `Help student prepare for SAT/ACT with focus on sections relevant to ${sector} admissions`
      );
      actions.push(
        `Connect with college admissions counselors from schools with top ${sector} programs`
      );
    } else {
      actions.push(
        `Finalize college applications with strong emphasis on ${careerTitle} program fit`
      );
      actions.push(
        `Complete scholarship applications, especially those specific to ${sector} careers`
      );
      actions.push(
        `Arrange final meetings with ${sector} professionals to confirm career choice`
      );
      actions.push(
        `Plan summer experience in ${sector} before college to build resume`
      );
    }
    
    // Add AI-specific action items if available
    if (aiRecommendations?.actionItems && aiRecommendations.actionItems.length > 0) {
      const highPriorityActions = aiRecommendations.actionItems
        .filter((item: any) => item.priority === 'high')
        .slice(0, 2);
      
      highPriorityActions.forEach((item: any) => {
        actions.push(`AI Priority: ${item.title} - ${item.description}`);
      });
    }
    
    // Add skill development actions
    if (topCareer?.skillGaps && topCareer.skillGaps.length > 0) {
      const criticalSkills = topCareer.skillGaps
        .filter((gap: any) => gap.importance === 'Critical')
        .slice(0, 2);
      
      criticalSkills.forEach((gap: any) => {
        actions.push(`Skill Development: Help student acquire ${gap.skill} through ${gap.howToAcquire}`);
      });
    }
    
    // Add summer planning
    actions.push(
      `Plan summer activities related to ${sector} (internships, camps, volunteer work, or courses)`
    );

    return actions;
  }

  private static getParentMeetingTopics(grade: number, careerMatches: any[], topCareer: any): string[] {
    const topics = [];
    const careerTitle = topCareer?.career?.title || 'recommended career';
    const sector = topCareer?.career?.sector || 'career field';
    const education = topCareer?.career?.requiredEducation || 'post-secondary education';
    const avgSalary = topCareer?.localOpportunities?.averageLocalSalary || topCareer?.career?.averageSalary;
    
    // Career choice discussion
    topics.push(
      `Review student's interest in ${careerTitle} and discuss why this career aligns with their strengths`
    );
    
    // Financial planning
    if (avgSalary) {
      topics.push(
        `Discuss career outlook: ${careerTitle} positions locally average $${avgSalary.toLocaleString()} annually`
      );
    }
    
    topics.push(
      `Financial planning for ${education} - discuss budget, savings, and scholarship opportunities`
    );
    
    // Education pathway
    topics.push(
      `Review education pathway: ${education} requirements and timeline for ${careerTitle}`
    );
    
    if (grade <= 10) {
      topics.push(
        `Discuss how to support career exploration in ${sector} during remaining high school years`
      );
      topics.push(
        `Plan for relevant course selection and extracurricular activities in ${sector}`
      );
    } else if (grade === 11) {
      topics.push(
        `Review college options with strong ${careerTitle} programs and discuss application strategy`
      );
      topics.push(
        `Plan for summer internship or job shadowing in ${sector} before senior year`
      );
      topics.push(
        `Discuss SAT/ACT preparation and college visit schedule`
      );
    } else {
      topics.push(
        `Finalize college choice and discuss transition planning for ${careerTitle} program`
      );
      topics.push(
        `Review financial aid packages and make final decision on affordability`
      );
      topics.push(
        `Discuss gap year options or immediate entry into ${sector} workforce if applicable`
      );
    }
    
    // Family support discussion
    topics.push(
      `Address any family concerns about ${careerTitle} career choice and discuss support strategies`
    );
    
    // Alternative paths
    if (careerMatches.length > 1) {
      const alternativeCareer = careerMatches[1]?.career?.title;
      if (alternativeCareer) {
        topics.push(
          `Discuss alternative option: ${alternativeCareer} as backup or complementary path`
        );
      }
    }

    return topics;
  }

  private static getAssessmentInsights(responses: any, careerMatches: any[]): string[] {
    const insights = [];
    const topCareer = careerMatches[0];
    
    // Extract meaningful insights from responses
    if (responses.workEnvironment) {
      insights.push(
        `Work environment preference: ${responses.workEnvironment} - aligns well with ${topCareer?.career?.sector || 'recommended'} careers`
      );
    }
    
    if (responses.helpingOthers) {
      const helpingLevel = responses.helpingOthers;
      if (helpingLevel === 'very important' || helpingLevel === 'important') {
        insights.push(
          `Strong desire to help others - excellent fit for ${topCareer?.career?.title || 'service-oriented careers'}`
        );
      }
    }
    
    if (responses.problemSolving) {
      insights.push(
        `Problem-solving approach: ${responses.problemSolving} - matches the analytical demands of ${topCareer?.career?.sector || 'recommended'} field`
      );
    }
    
    if (responses.educationCommitment || responses.q5_education_willingness) {
      const education = responses.educationCommitment || responses.q5_education_willingness;
      insights.push(
        `Education commitment: ${education} - appropriate for ${topCareer?.career?.requiredEducation || 'career requirements'}`
      );
    }
    
    if (responses.subjectsStrengths || responses.q4_academic_performance) {
      const subjects = responses.subjectsStrengths || responses.q4_academic_performance;
      if (Array.isArray(subjects)) {
        insights.push(
          `Academic strengths in ${subjects.slice(0, 3).join(', ')} support ${topCareer?.career?.sector || 'career'} pathway`
        );
      } else if (typeof subjects === 'object') {
        const strongSubjects = Object.entries(subjects)
          .filter(([_, rating]: [string, any]) => rating === 'excellent' || rating === 'good')
          .map(([subject]) => subject);
        if (strongSubjects.length > 0) {
          insights.push(
            `Strong academic performance in ${strongSubjects.slice(0, 3).join(', ')} - excellent foundation for ${topCareer?.career?.title || 'career goals'}`
          );
        }
      }
    }
    
    if (responses.interestsPassions || responses.q19_20_impact_inspiration) {
      const interests = responses.interestsPassions || responses.q19_20_impact_inspiration;
      if (typeof interests === 'string' && interests.length > 10) {
        insights.push(
          `Personal interests and passions: "${interests.substring(0, 100)}${interests.length > 100 ? '...' : ''}" - demonstrates genuine motivation for career path`
        );
      }
    }
    
    // Add career match context
    if (topCareer?.matchScore) {
      insights.push(
        `Overall career match score: ${topCareer.matchScore}% for ${topCareer.career.title} - ${
          topCareer.matchScore >= 85 ? 'excellent alignment' :
          topCareer.matchScore >= 75 ? 'strong alignment' :
          'good alignment'
        }`
      );
    }
    
    // If no specific insights, add general observation
    if (insights.length === 0) {
      insights.push(
        `Student completed comprehensive assessment - recommendations based on expressed interests and career preferences`
      );
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
- Geographic Focus: Provide REAL employer names that hire for these careers in or near ZIP code ${zipCode}

STUDENT ASSESSMENT RESPONSES:
${Object.entries(responses)
  .filter(([key]) => !['grade', 'zipCode', 'basic_info'].includes(key))
  .map(([questionId, answer]) => {
    const cleanAnswer = typeof answer === 'object' ? JSON.stringify(answer) : answer;
    return `${questionId}: ${cleanAnswer}`;
  })
  .join('\n')}

OUTPUT REQUIREMENTS:
Generate a structured JSON response with 5-8 career matches.
IMPORTANT: For topEmployers, provide actual company/organization names that hire for each career in the ZIP ${zipCode} area (e.g., specific hospitals, tech companies, school districts, construction firms, retail chains, etc.). Use real employer names that would appear in job search platforms like Adzuna, Indeed, or LinkedIn. Examples: "Kaiser Permanente", "Microsoft", "Home Depot", "Local Public Schools", etc. Do NOT use generic placeholders.

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
        "topEmployers": ["Specific local employer name 1", "Specific local employer name 2", "Specific local employer name 3"],
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
      const parsedResponse = this.parseDecidedAIResponse(aiResponse, grade, zipCode, responses);
      
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
      return this.generateBasicFallback(grade, zipCode, responses);
    }
  }

  /**
   * Parse AI response for decided students
   */
  private static parseDecidedAIResponse(aiResponse: string, grade: string, zipCode: string, responses: any): any {
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
          careerReadiness: 'Developing',
          courseHistory: this.extractCourseHistory(responses)
        },
        topJobMatches: careerMatches,
        parentSummary: this.generateDynamicParentSummary(careerMatches, parseInt(grade), zipCode, parsed),
        counselorNotes: this.generateDynamicCounselorNotes(careerMatches, parseInt(grade), {}, parsed),
        careerRoadmap: this.generateDynamicCareerRoadmap(parseInt(grade), careerMatches, parsed.careerPathway),
        aiRecommendations: {
          academicPlan: {
            currentYear: parsed.careerPathway?.steps?.slice(0, 2).map((step: string, idx: number) => ({
              courseCode: `STEP-${idx + 1}`,
              courseName: step.substring(0, 50),
              description: step,
              credits: 4,
              provider: 'High School / College',
              semester: idx === 0 ? 'Current' : 'Next',
              priority: 'high' as const
            })) || [],
            nextYear: parsed.careerPathway?.steps?.slice(2, 4).map((step: string, idx: number) => ({
              courseCode: `FUTURE-${idx + 1}`,
              courseName: step.substring(0, 50),
              description: step,
              credits: 4,
              provider: 'College / Training',
              semester: 'Future',
              priority: 'medium' as const
            })) || [],
            longTerm: parsed.careerPathway?.steps?.slice(4).map((step: string, idx: number) => ({
              courseCode: `LONG-${idx + 1}`,
              courseName: step.substring(0, 50),
              description: step,
              credits: 0,
              provider: 'Career Development',
              semester: 'Long-term',
              priority: 'medium' as const
            })) || []
          },
          localJobs: [],
          careerPathway: parsed.careerPathway || {},
          skillGaps: parsed.skillGaps || [],
          actionItems: (parsed.nextSteps || []).map((step: string, idx: number) => ({
            title: `Action Step ${idx + 1}`,
            description: step,
            priority: idx === 0 ? 'high' as const : 'medium' as const,
            timeline: idx === 0 ? 'Immediate' : idx === 1 ? 'Short-term (1-6 months)' : 'Long-term (6+ months)'
          })),
          aiProcessed: true // Flag to indicate real AI was used
        }
      };
    } catch (parseError) {
      console.error('❌ Failed to parse decided AI response:', parseError);
      return this.generateBasicFallback(grade, zipCode, responses);
    }
  }

  /**
   * Basic fallback when AI completely fails
   */
  private static generateBasicFallback(grade: string, zipCode: string, responses?: any): any {
    return {
      studentProfile: {
        grade: parseInt(grade),
        location: zipCode,
        strengths: ['Academic performance', 'Communication skills'],
        interests: ['Career exploration'],
        careerReadiness: 'Developing',
        courseHistory: responses ? this.extractCourseHistory(responses) : undefined
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

  /**
   * Extract course history from assessment responses
   */
  private static extractCourseHistory(responses: any): { [subject: string]: string } | undefined {
    const courseHistory = responses.q4b_course_history;
    
    if (!courseHistory || typeof courseHistory !== 'object') {
      return undefined;
    }

    // Filter out empty entries and return clean course history
    const cleanHistory: { [subject: string]: string } = {};
    
    Object.entries(courseHistory).forEach(([subject, courses]: [string, any]) => {
      if (courses && typeof courses === 'string' && courses.trim()) {
        cleanHistory[subject] = courses.trim();
      }
    });

    return Object.keys(cleanHistory).length > 0 ? cleanHistory : undefined;
  }

  /**
   * Generate enhanced career roadmaps for all recommended careers
   */
  static async generateEnhancedCareerRoadmaps(
    careerMatches: any[], 
    responses: any, 
    grade: number, 
    zipCode: string
  ): Promise<any[]> {
    console.log(`🗺️ Generating enhanced roadmaps for ${careerMatches.length} careers`);
    
    const roadmaps = [];
    
    // Extract student data from responses
    const studentData = {
      grade: grade,
      zipCode: zipCode,
      courseHistory: this.extractCourseHistory(responses) || {},
      academicPerformance: responses.q4_academic_performance || {},
      supportLevel: this.extractSupportLevel(responses),
      educationCommitment: responses.q7_education_commitment || 'bachelors'
    };

    // Generate roadmap for each career (limit to top 5 to avoid rate limits)
    const topCareers = careerMatches.slice(0, 5);
    
    for (const match of topCareers) {
      try {
        const roadmapInput: CareerRoadmapInput = {
          career: {
            title: match.career.title,
            sector: match.career.sector || 'general',
            requiredEducation: match.career.requiredEducation || 'High school diploma',
            averageSalary: match.career.averageSalary || 50000,
            description: match.career.description || `Career in ${match.career.title}`
          },
          studentData: studentData
        };

        const roadmap = await CareerRoadmapService.generateCareerRoadmap(roadmapInput);
        roadmaps.push({
          careerTitle: match.career.title,
          matchScore: match.matchScore,
          roadmap: roadmap
        });
        
        console.log(`✅ Generated enhanced roadmap for ${match.career.title}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to generate roadmap for ${match.career.title}:`, error);
        // Continue with other careers
      }
    }

    console.log(`✅ Generated ${roadmaps.length} enhanced career roadmaps`);
    return roadmaps;
  }

  /**
   * Extract support level from responses
   */
  private static extractSupportLevel(responses: any): string {
    // Look for support-related questions in responses
    if (responses.q6_helping_others) {
      const helpingLevel = responses.q6_helping_others;
      if (helpingLevel === 'very_important') return 'high';
      if (helpingLevel === 'somewhat_important') return 'moderate';
      return 'low';
    }
    
    // Default to moderate support
    return 'moderate';
  }
}