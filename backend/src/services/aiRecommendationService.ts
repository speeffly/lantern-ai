import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudentProfile, AssessmentAnswer, CareerMatch, AIRecommendations, LocalJobOpportunity, CourseRecommendation } from '../types';
import { FeedbackService } from './feedbackService';
import { RealJobProvider } from './realJobProvider';
import { CareerMatchingService, EnhancedCareerMatch } from './careerMatchingService';
import { ParentSummaryService, ParentSummary } from './parentSummaryService';
import { AcademicPlanService, FourYearPlan } from './academicPlanService';

// Using CourseRecommendation and LocalJobOpportunity interfaces from types/index.ts

// Using AIRecommendations interface from types/index.ts

export class AIRecommendationService {
  /**
   * Generate comprehensive career guidance package
   */
  static async generateComprehensiveGuidance(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): Promise<{
    enhancedCareerMatches: EnhancedCareerMatch[];
    counselorRecommendations: AIRecommendations;
    parentSummary: ParentSummary;
    fourYearPlan: FourYearPlan;
  }> {
    try {
      console.log('🎯 Generating comprehensive career guidance package...');

      // Generate all components in parallel for efficiency
      const [
        enhancedCareerMatches,
        counselorRecommendations,
        parentSummary,
        fourYearPlan
      ] = await Promise.all([
        CareerMatchingService.getEnhancedMatches(profile, answers, careerMatches),
        this.generateRecommendations(profile, answers, careerMatches, zipCode, currentGrade),
        ParentSummaryService.generateParentSummary(profile, answers, careerMatches, currentGrade),
        AcademicPlanService.generateFourYearPlan(profile, answers, careerMatches, zipCode, currentGrade)
      ]);

      console.log('✅ Comprehensive career guidance package generated successfully');
      
      return {
        enhancedCareerMatches,
        counselorRecommendations,
        parentSummary,
        fourYearPlan
      };

    } catch (error) {
      console.error('❌ Comprehensive guidance generation failed:', error);
      throw new Error(`Failed to generate comprehensive career guidance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate comprehensive AI-powered recommendations with feedback integration
   */
  static async generateRecommendations(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): Promise<AIRecommendations> {
    try {
      console.log('🤖 Generating AI recommendations for profile:', profile.interests);
      
      // Validate AI configuration
      const aiConfig = this.validateAIConfiguration();
      console.log('🔧 AI Configuration:', aiConfig);

      // Check if we should use real OpenAI or fallback mode
      const useRealAI = process.env.USE_REAL_AI === 'true';
      
      console.log('🔧 AI Mode Configuration:');
      console.log('   - USE_REAL_AI flag:', useRealAI);
      console.log('   - AI Provider:', aiConfig.provider);
      console.log('   - Provider available:', aiConfig.available);
      
      // If real AI is requested but no valid provider, throw error
      if (useRealAI && !aiConfig.available) {
        console.error('❌ Real AI requested but no valid AI provider configured');
        throw new Error(`Real AI mode enabled but ${aiConfig.provider} API key is missing or invalid. Please configure ${aiConfig.provider.toUpperCase()}_API_KEY environment variable.`);
      }
      
      // If not using real AI, use fallback recommendations
      if (!useRealAI) {
        console.log('🔄 Using fallback AI recommendations (USE_REAL_AI=false)');
        return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
      }

      // Get feedback-based improvements for career recommendations
      const feedbackImprovements = await this.getFeedbackImprovements(careerMatches);

      // Get real jobs first
      const localJobs = await this.generateLocalJobOpportunities(careerMatches, zipCode);
      
      // Prepare context for AI (now includes real job data)
      console.log('\n' + '='.repeat(80));
      console.log('📊 PREPARING STUDENT CONTEXT FOR AI');
      console.log('='.repeat(80));
      console.log('Student Profile:', JSON.stringify(profile, null, 2));
      console.log('Assessment Answers Count:', answers.length);
      console.log('Feedback Improvements:', feedbackImprovements.length, 'suggestions found');
      if (feedbackImprovements.length > 0) {
        console.log('Improvement Suggestions:', feedbackImprovements);
      }
      console.log('Career Matches Count:', careerMatches.length);
      console.log('Real Jobs Found:', localJobs.length);
      console.log('ZIP Code:', zipCode);
      console.log('Current Grade:', currentGrade);
      console.log('='.repeat(80));
      
      const context = this.prepareAIContext(profile, answers, careerMatches, zipCode, currentGrade, feedbackImprovements, localJobs);
      
      console.log('\n📋 GENERATED CONTEXT FOR AI:');
      console.log('-'.repeat(50));
      console.log(context);
      console.log('='.repeat(80) + '\n');
      
      // Generate recommendations using AI (OpenAI or Gemini)
      const aiResponse = await this.callAI(context);
      
      // Parse and structure the AI response
      console.log('\n' + '='.repeat(80));
      console.log('🔄 PARSING AI RESPONSE INTO STRUCTURED RECOMMENDATIONS');
      console.log('='.repeat(80));
      
      const recommendations = await this.parseAIResponse(aiResponse, profile, careerMatches, zipCode, localJobs, currentGrade);
      
      // Use the real jobs we already fetched
      recommendations.localJobs = localJobs;
      
      console.log('\n📊 FINAL STRUCTURED RECOMMENDATIONS:');
      console.log('-'.repeat(50));
      console.log('Academic Plan Items:', recommendations.academicPlan?.currentYear?.length || 0);
      console.log('Local Jobs:', recommendations.localJobs?.length || 0);
      console.log('Career Pathway Steps:', recommendations.careerPathway?.steps?.length || 0);
      console.log('Skill Gaps:', recommendations.skillGaps?.length || 0);
      console.log('Action Items:', recommendations.actionItems?.length || 0);
      
      console.log('\n📋 COMPLETE RECOMMENDATIONS OBJECT:');
      console.log('-'.repeat(50));
      console.log(JSON.stringify(recommendations, null, 2));
      console.log('='.repeat(80));
      
      console.log('\n✅ AI RECOMMENDATION GENERATION COMPLETE');
      console.log('='.repeat(80) + '\n');
      
      return recommendations;
    } catch (error) {
      console.error('❌ AI recommendation generation failed:', error);
      
      // If real AI is enabled, re-throw error
      const useRealAI = process.env.USE_REAL_AI === 'true';
      if (useRealAI) {
        throw new Error(`Real AI recommendation service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Otherwise, fallback to rule-based recommendations
      console.log('🔄 Falling back to rule-based recommendations due to error');
      return await this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
    }
  }

  /**
   * Prepare comprehensive context for AI prompt
   */
  private static prepareAIContext(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number,
    feedbackImprovements?: string[],
    realJobs?: LocalJobOpportunity[]
  ): string {
    const grade = currentGrade || 11;
    const interests = profile.interests?.join(', ') || 'Exploring career options';
    const skills = profile.skills?.join(', ') || 'Developing foundational skills';
    
    return `
COMPREHENSIVE STUDENT PROFILE FOR CAREER COUNSELING SESSION:

STUDENT DEMOGRAPHICS & CONTEXT:

- Current Academic Level: Grade ${grade} (Age: ${14 + (grade - 9)} years old)
- Geographic Location: ZIP Code ${zipCode} (Rural community setting)
- Academic Timeline: ${grade === 12 ? 'Senior year - immediate post-graduation planning needed' : 
                     grade === 11 ? 'Junior year - critical planning period for post-secondary decisions' :
                     grade === 10 ? 'Sophomore year - foundation building and exploration phase' :
                     'Freshman year - early career awareness and academic foundation'}

DETAILED INTEREST & PREFERENCE ANALYSIS:
- Primary Interest Areas: ${interests}
- Demonstrated Skills & Strengths: ${skills}
- Preferred Work Environment: ${profile.workEnvironment || 'Mixed indoor/outdoor settings'}
- Collaboration Style: ${profile.teamPreference || 'Comfortable with both team and individual work'}
- Educational Commitment Level: ${profile.educationGoal || 'Open to certificate through associate degree programs'}

COMPREHENSIVE ASSESSMENT RESPONSE ANALYSIS:
${answers.map((answer, index) => {
  const interpretation = this.interpretAssessmentAnswer(answer.questionId, answer.answer);
  return `${index + 1}. Question: ${answer.questionId}
   → Student's Answer: "${answer.answer}"
   → Key Insight: ${interpretation}
   → Career Implications: ${this.getCareerDevelopmentNotes(answer.questionId, answer.answer)}`;
}).join('\n\n')}

TOP CAREER MATCHES - DETAILED PROFESSIONAL ANALYSIS:
${careerMatches.slice(0, 5).map((match, index) => {
  return `${index + 1}. ${match.career.title} (${match.matchScore}% match)
   - Sector: ${match.career.sector}
   - Education Required: ${match.career.requiredEducation}
   - Average Salary: $${match.career.averageSalary.toLocaleString()}
   - Key Responsibilities: ${match.career.responsibilities?.slice(0, 3).join(', ') || 'Various duties'}
   - Required Certifications: ${match.career.certifications?.join(', ') || 'None specified'}
   - Growth Outlook: ${match.career.growthOutlook || 'Stable'}
   - Match Reasons: ${match.reasoningFactors?.join(', ') || 'Strong alignment with interests'}
   - Local Demand: ${match.localDemand}`;
}).join('\n\n')}

RURAL COMMUNITY CONTEXT & STRATEGIC CONSIDERATIONS:

Geographic & Economic Environment:
- Rural location with unique opportunities and challenges
- Lower cost of living but potentially adjusted wage scales
- Strong community networks and relationship-based opportunities
- Limited public transportation - personal vehicle typically essential
- Seasonal employment patterns in agriculture and tourism sectors

Educational Access & Training Resources:
- Community college likely within 30-50 mile radius
- Online and distance learning increasingly important for skill development
- Dual enrollment opportunities may be available through high school
- Regional trade schools and vocational training centers
- Apprenticeship programs through local employers and unions
- Professional development through agricultural extension and community organizations

Career Development Landscape:
- Healthcare sector expansion due to aging rural populations
- Infrastructure maintenance and development needs
- Agricultural technology and precision farming opportunities
- Small business and entrepreneurship potential with lower startup costs
- Remote work possibilities in technology and professional services
- Government and public service positions with stability
- Tourism, recreation, and outdoor industry growth potential

Family & Community Dynamics:
- Strong family ties and multi-generational considerations
- Community leadership and civic engagement opportunities
- Local mentorship through established professionals
- Word-of-mouth networking and relationship-based hiring
- Potential family business involvement or succession planning
- Community values alignment important for career satisfaction

REAL JOB MARKET ANALYSIS - CURRENT OPPORTUNITIES:
${realJobs && realJobs.length > 0 ? 
  `Based on live job market data from Adzuna API, here are actual job opportunities available now in the ${zipCode} area:

${realJobs.slice(0, 8).map((job, index) => {
  return `${index + 1}. ${job.title} at ${job.company}
   - Location: ${job.location} (${job.distance} miles away)
   - Salary: ${job.salary}
   - Requirements: ${job.requirements.join(', ')}
   - Posted: ${job.posted || 'Recently'}
   - Category: ${job.category || 'General'}
   - Application: ${job.url ? 'Direct application available' : 'Contact employer'}
   - Job Summary: ${job.description.substring(0, 150)}...`;
}).join('\n\n')}

MARKET INSIGHTS:
- Total relevant jobs found: ${realJobs.length}
- Average distance from student: ${Math.round(realJobs.reduce((sum, job) => sum + job.distance, 0) / realJobs.length)} miles
- Job categories represented: ${[...new Set(realJobs.map(job => job.category).filter(Boolean))].join(', ')}
- Companies actively hiring: ${[...new Set(realJobs.map(job => job.company))].slice(0, 5).join(', ')}

RECOMMENDATION FOCUS: Use this real job market data to provide specific, actionable advice. Reference actual employers, salary ranges, and job requirements in your recommendations.` :
  'Real job market data not available - provide general career guidance based on career matches and location.'
}

COUNSELING SESSION FOCUS AREAS:
This comprehensive profile indicates the need for detailed guidance on:
1. Strategic academic planning for remaining high school years
2. Post-secondary education and training pathway optimization
3. Skill development priorities with rural resource considerations
4. Local and regional career opportunity identification
5. Financial planning for education and career preparation
6. Professional networking strategies in rural communities
7. Specific, measurable action steps with realistic timelines and accountability measures

FEEDBACK-BASED IMPROVEMENT INSIGHTS:
${feedbackImprovements && feedbackImprovements.length > 0 ? 
  `Based on feedback from previous students with similar profiles, please incorporate these improvement suggestions:
${feedbackImprovements.map((improvement, index) => `${index + 1}. ${improvement}`).join('\n')}

These insights should be integrated into your recommendations to provide more personalized and effective guidance.` :
  'No specific feedback improvements available yet - provide comprehensive baseline recommendations.'
}
    `;
  }

  /**
   * Interpret assessment answers to provide context
   */
  private static interpretAssessmentAnswer(questionId: string, answer: string | number): string {
    const interpretations: { [key: string]: { [key: string]: string } } = {
      'interests': {
        'Hands-on Work': 'strong preference for practical, manual tasks and building/fixing things',
        'Healthcare': 'desire to help others and work in medical/health-related fields',
        'Technology': 'interest in computers, digital tools, and technical problem-solving',
        'Community Impact': 'motivation to make a difference in their local community'
      },
      'work_environment': {
        'Outdoors': 'preference for outdoor work environments and physical activity',
        'Indoors': 'comfort with office or indoor work settings',
        'Mixed': 'flexibility and adaptability to various work environments'
      },
      'education': {
        'certificate': 'preference for shorter-term, practical training programs',
        'associate': 'willingness to pursue 2-year college programs',
        'bachelor': 'commitment to 4-year university education'
      }
    };

    const category = interpretations[questionId];
    if (category && typeof answer === 'string' && category[answer]) {
      return category[answer];
    }
    
    return `student preference or characteristic: ${answer}`;
  }

  /**
   * Validate AI configuration and determine available provider
   */
  private static validateAIConfiguration(): { provider: string; available: boolean; reason?: string } {
    const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    
    console.log('🔧 Validating AI configuration...');
    console.log('   - Requested provider:', aiProvider);
    
    switch (aiProvider) {
      case 'openai':
        const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
        const openAIKeyLength = process.env.OPENAI_API_KEY?.length || 0;
        console.log('   - OpenAI API key present:', hasOpenAIKey);
        console.log('   - OpenAI API key length:', openAIKeyLength);
        
        if (!hasOpenAIKey) {
          return {
            provider: 'openai',
            available: false,
            reason: 'OPENAI_API_KEY environment variable is missing'
          };
        }
        
        if (openAIKeyLength < 20) {
          return {
            provider: 'openai',
            available: false,
            reason: 'OPENAI_API_KEY appears to be invalid (too short)'
          };
        }
        
        return { provider: 'openai', available: true };
        
      case 'gemini':
        const hasGeminiKey = !!process.env.GEMINI_API_KEY;
        const geminiKeyLength = process.env.GEMINI_API_KEY?.length || 0;
        console.log('   - Gemini API key present:', hasGeminiKey);
        console.log('   - Gemini API key length:', geminiKeyLength);
        
        if (!hasGeminiKey) {
          return {
            provider: 'gemini',
            available: false,
            reason: 'GEMINI_API_KEY environment variable is missing'
          };
        }
        
        if (geminiKeyLength < 20) {
          return {
            provider: 'gemini',
            available: false,
            reason: 'GEMINI_API_KEY appears to be invalid (too short)'
          };
        }
        
        return { provider: 'gemini', available: true };
        
      default:
        console.log('   - Invalid AI provider specified:', aiProvider);
        return {
          provider: aiProvider,
          available: false,
          reason: `Invalid AI provider '${aiProvider}'. Supported providers: 'openai', 'gemini'`
        };
    }
  }

  /**
   * Call AI API (OpenAI or Gemini) for comprehensive recommendations
   */
  static async callAI(context: string): Promise<string> {
    const aiConfig = this.validateAIConfiguration();
    
    console.log('🤖 AI Provider Configuration:', aiConfig);
    
    if (!aiConfig.available) {
      throw new Error(`AI Provider '${aiConfig.provider}' is not available: ${aiConfig.reason}`);
    }
    
    if (aiConfig.provider === 'gemini') {
      return this.callGemini(context);
    } else if (aiConfig.provider === 'openai') {
      return this.callOpenAI(context);
    } else {
      throw new Error(`Unsupported AI provider: ${aiConfig.provider}`);
    }
  }

  /**
   * Call Google Gemini API for comprehensive recommendations
   */
  private static async callGemini(context: string): Promise<string> {
    console.log('🔑 Initializing Gemini client with key length:', process.env.GEMINI_API_KEY?.length || 0);
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for Gemini AI provider');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `You are Alex Johnson, a modern career coach specializing in technology and entrepreneurship for Gen Z students. You have:

CREDENTIALS:
- MBA in Business Innovation and Technology
- Certified Professional Career Coach (CPCC)
- 10 years experience in startup ecosystems and tech careers
- Former software engineer turned career strategist

EXPERTISE:
- Emerging technology careers and digital economy trends
- Remote work opportunities and digital nomad lifestyle
- Startup culture and entrepreneurship pathways
- Online learning platforms and skill development
- Social media and personal branding for career success
- Gig economy and freelance career strategies
- Tech bootcamps and alternative education paths

COACHING APPROACH:
- Forward-thinking and innovation-focused
- Emphasizes adaptability and continuous learning
- Encourages creative problem-solving and risk-taking
- Uses modern language and references students understand
- Focuses on building personal brand and online presence
- Practical advice with real-world examples from tech industry
- Emphasizes networking through social media and online communities

You provide cutting-edge career advice that prepares students for the future of work, with emphasis on technology, creativity, and entrepreneurial thinking.`;

    const userPrompt = `${context}

As Alex Johnson, provide innovative career guidance for this high school student. Focus on emerging opportunities, technology careers, and entrepreneurial pathways. Your recommendations should be forward-thinking and prepare them for the future of work.

IMPORTANT: Respond with ONLY valid JSON. Do not include any text before or after the JSON object. Ensure all strings are properly quoted and all objects/arrays are properly closed.

Provide your analysis in the following JSON format with cutting-edge, future-focused recommendations:

{
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Specific course name",
        "reasoning": "Why this course is essential for future careers",
        "careerConnection": "How this connects to emerging opportunities",
        "skillsDeveloped": ["skill1", "skill2", "skill3"],
        "priority": "Essential|Highly Recommended|Recommended"
      }
    ],
    "nextYear": [],
    "longTerm": []
  },
  "careerPathway": {
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "timeline": "Timeline description",
    "requirements": ["Requirement 1", "Requirement 2"]
  },
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "Critical|Important|Beneficial",
      "howToAcquire": "How to develop this skill"
    }
  ],
  "actionItems": [
    {
      "title": "Action title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "timeline": "When to complete"
    }
  ]
}

Remember: Focus on technology, innovation, and preparing for the future of work.`;

    // Log the prompts
    console.log('\n' + '='.repeat(80));
    console.log('🤖 GEMINI API CALL - PROMPT LOGGING');
    console.log('='.repeat(80));
    
    console.log('\n📋 SYSTEM PROMPT (Career Coach Persona):');
    console.log('-'.repeat(50));
    console.log(systemPrompt);
    
    console.log('\n📝 USER PROMPT (Student Context & Instructions):');
    console.log('-'.repeat(50));
    console.log(userPrompt);
    
    console.log('\n⚙️ API CONFIGURATION:');
    console.log('-'.repeat(50));
    console.log('Model: gemini-2.0-flash-exp');
    console.log('Provider: Google Gemini');
    console.log('Context Length:', context.length, 'characters');
    console.log('System Prompt Length:', systemPrompt.length, 'characters');
    console.log('User Prompt Length:', userPrompt.length, 'characters');
    console.log('Total Prompt Length:', (systemPrompt.length + userPrompt.length), 'characters');
    
    console.log('\n🚀 Sending request to Gemini...');
    console.log('='.repeat(80));

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = result.response.text();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ GEMINI API RESPONSE RECEIVED');
    console.log('='.repeat(80));
    console.log('Response Length:', response.length, 'characters');
    console.log('Model Used: gemini-2.0-flash-exp');
    
    console.log('\n📄 RAW AI RESPONSE:');
    console.log('-'.repeat(50));
    console.log(response);
    console.log('='.repeat(80) + '\n');

    return response;
  }

  /**
   * Call OpenAI API for comprehensive recommendations
   */
  private static async callOpenAI(context: string): Promise<string> {
    console.log('🔑 Initializing OpenAI client with key length:', process.env.OPENAI_API_KEY?.length || 0);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    const systemPrompt = `You are Alex Johnson, a modern career coach specializing in technology and entrepreneurship for Gen Z students. You have:

CREDENTIALS:
- MBA in Business Innovation and Technology
- Certified Professional Career Coach (CPCC)
- 10 years experience in startup ecosystems and tech careers
- Former software engineer turned career strategist

EXPERTISE:
- Emerging technology careers and digital economy trends
- Remote work opportunities and digital nomad lifestyle
- Startup culture and entrepreneurship pathways
- Online learning platforms and skill development
- Social media and personal branding for career success
- Gig economy and freelance career strategies
- Tech bootcamps and alternative education paths

COACHING APPROACH:
- Forward-thinking and innovation-focused
- Emphasizes adaptability and continuous learning
- Encourages creative problem-solving and risk-taking
- Uses modern language and references students understand
- Focuses on building personal brand and online presence
- Practical advice with real-world examples from tech industry
- Emphasizes networking through social media and online communities

You provide cutting-edge career advice that prepares students for the future of work, with emphasis on technology, creativity, and entrepreneurial thinking.`;

const userPrompt = `${context}

As Dr. Sarah Martinez, provide comprehensive career guidance for this rural high school student. Your recommendations should be detailed, practical, and specifically tailored to their rural context. Use your 15 years of experience to provide professional-quality guidance. Factor the provided ZIP code into every recommendation (local availability, commuting feasibility, remote or hybrid options).

IMPORTANT: Respond with ONLY valid JSON. Do not include any text before or after the JSON object. Ensure all strings are properly quoted and all objects/arrays are properly closed.

Provide your analysis in the following JSON format with cutting-edge, future-focused recommendations:

{
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Specific course name (e.g., 'Advanced Biology with Lab')",
        "reasoning": "Detailed professional explanation of why this course is essential for their specific career goals, including how it builds foundational knowledge",
        "careerConnection": "Specific explanation of how this course directly connects to their top career matches and future opportunities",
        "skillsDeveloped": ["specific technical skill", "specific soft skill", "specific academic skill"],
        "priority": "Essential|Highly Recommended|Recommended",
        "localAvailability": "Detailed information about how to access this course (high school offering, dual enrollment, online options, community college)",
        "prerequisites": "Any required previous courses or skills",
        "timeCommitment": "Expected hours per week and semester length"
      }
    ],
    "nextYear": [
      {
        "courseName": "Advanced course building on current year foundation",
        "reasoning": "Professional explanation of why this progression is important for career development",
        "careerConnection": "How this advanced course enhances career pathway preparation",
        "skillsDeveloped": ["advanced skill 1", "advanced skill 2", "leadership skill"],
        "priority": "Essential|Highly Recommended|Recommended",
        "localAvailability": "Access information including backup options",
        "prerequisites": "Required foundation from current year",
        "timeCommitment": "Expected commitment level"
      }
    ],
    "longTerm": [
      {
        "option": "Specific post-secondary education or training program name",
        "description": "Detailed description of the program, curriculum, and outcomes",
        "duration": "Specific time required (e.g., '18-month certificate program')",
        "cost": "Realistic cost range including tuition, fees, materials",
        "location": "Specific information about where available (local community college name, regional options, reputable online programs)",
        "careerOutcomes": "Specific careers this leads to with salary ranges",
        "admissionRequirements": "What's needed to get accepted",
        "financialAid": "Available scholarships, grants, and funding options"
      }
    ]
  },
  "careerPathway": {
    "steps": [
      "Specific immediate action for next 6 months with clear deliverables",
      "Detailed short-term goal for 6 months - 2 years with measurable outcomes",
      "Comprehensive medium-term objective for 2-5 years with career milestones",
      "Long-term vision for 5+ years with advancement opportunities"
    ],
    "timeline": "Detailed timeline from high school graduation to established career with key milestones",
    "requirements": ["Specific educational requirement", "Specific certification requirement", "Specific experience requirement"],
    "ruralConsiderations": "Detailed analysis of rural-specific factors including transportation, family considerations, local opportunities, and community connections",
    "financialPlanning": "Comprehensive cost analysis including education expenses, living costs, expected salary progression, and ROI timeline",
    "alternativePathways": "Backup options and alternative routes to similar career outcomes"
  },
  "skillGaps": [
    {
      "skill": "Specific skill name (e.g., 'Medical Terminology and Documentation')",
      "importance": "Critical|Important|Beneficial",
      "currentLevel": "Assessment of student's current ability in this area",
      "targetLevel": "What level they need to reach for career success",
      "howToAcquire": "Detailed, specific methods to develop this skill including courses, programs, and self-study options",
      "timeline": "Realistic timeframe for skill development with milestones",
      "resources": "Specific resources including online courses, local programs, books, mentors",
      "practiceOpportunities": "Concrete ways to practice and apply this skill in real situations",
      "assessmentMethods": "How to measure progress and competency",
      "ruralChallenges": "Specific challenges for developing this skill in a rural area and solutions"
    }
  ],
  "actionItems": [
    {
      "title": "Specific, actionable title (e.g., 'Schedule Meeting with School Counselor About Dual Enrollment')",
      "description": "Detailed description of exactly what to do, why it's important, and expected outcomes",
      "priority": "high|medium|low",
      "timeline": "Specific timeframe with deadlines (e.g., 'Complete by end of this week')",
      "category": "Academic|Career Exploration|Skill Development|Networking|Financial Planning",
      "steps": ["Detailed step 1 with specific actions", "Detailed step 2 with specific actions", "Detailed step 3 with specific actions"],
      "resources": "Specific resources needed including contact information, websites, materials",
      "successMetrics": "Clear, measurable ways to determine completion and success",
      "potentialObstacles": "Likely challenges and how to overcome them",
      "followUpActions": "What to do after completing this action item"
    }
  ],
  "localOpportunities": [
    {
      "type": "Volunteer|Internship|Part-time Job|Mentorship|Job Shadow",
      "organization": "Realistic local organization name and type (e.g., 'County General Hospital', 'Local Construction Company')",
      "description": "Detailed description of what the opportunity involves and time commitment",
      "skills": "Specific skills that will be gained from this opportunity",
      "careerRelevance": "Detailed explanation of how this connects to their career goals and builds their resume",
      "howToApply": "Step-by-step process for pursuing this opportunity including contact methods",
      "requirements": "Any age, skill, or other requirements",
      "benefits": "What the student will gain beyond just experience",
      "timeline": "When to apply and typical duration of opportunity"
    }
  ]
}

Remember: You are providing professional career counseling to a rural high school student. Your recommendations should be comprehensive, realistic, and specifically tailored to their rural context while maintaining the high standards of professional career guidance. Include specific details that demonstrate your expertise and provide genuine value to help this student succeed in their chosen career path.`;

    // Log the complete prompts being sent to OpenAI
    console.log('\n' + '='.repeat(80));
    console.log('🤖 OPENAI API CALL - PROMPT LOGGING');
    console.log('='.repeat(80));
    
    console.log('\n📋 SYSTEM PROMPT (Career Counselor Persona):');
    console.log('-'.repeat(50));
    console.log(systemPrompt);
    
    console.log('\n📝 USER PROMPT (Student Context & Instructions):');
    console.log('-'.repeat(50));
    console.log(userPrompt);
    
    console.log('\n⚙️ API CONFIGURATION:');
    console.log('-'.repeat(50));
    console.log('Model: gpt-3.5-turbo');
    console.log('Max Tokens: 4000');
    console.log('Temperature: 0.7');
    console.log('Context Length:', context.length, 'characters');
    console.log('System Prompt Length:', systemPrompt.length, 'characters');
    console.log('User Prompt Length:', userPrompt.length, 'characters');
    console.log('Total Prompt Length:', (systemPrompt.length + userPrompt.length), 'characters');
    
    console.log('\n🚀 Sending request to OpenAI...');
    console.log('='.repeat(80));

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ OPENAI API RESPONSE RECEIVED');
    console.log('='.repeat(80));
    console.log('Response Length:', response.length, 'characters');
    console.log('Tokens Used:', completion.usage?.total_tokens || 'unknown');
    console.log('Model Used:', completion.model);
    
    console.log('\n📄 RAW AI RESPONSE:');
    console.log('-'.repeat(50));
    console.log(response);
    console.log('='.repeat(80) + '\n');

    return response;
  }

  /**
   * Parse AI response into structured recommendations
   */
  private static async parseAIResponse(
    aiResponse: string,
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string,
    localJobs: LocalJobOpportunity[],
    currentGrade?: number
  ): Promise<AIRecommendations> {
    try {
      console.log('🔍 Raw AI response length:', aiResponse.length);
      
      // Clean the response thoroughly
      let cleanedResponse = aiResponse
        // Remove markdown code blocks
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        // Remove control characters and fix common issues
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Extract JSON object
      let jsonMatch = cleanedResponse.match(/\{.*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      let jsonString = jsonMatch[0];
      
      // Additional JSON cleanup
      jsonString = jsonString
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*([^",{\[\]}\s][^",{\[\]}\n]*?)(\s*[,}\]])/g, ': "$1"$2'); // Quote unquoted string values
      
      console.log('🔍 Cleaned JSON preview:', jsonString.substring(0, 300) + '...');
      
      // Parse the cleaned JSON
      const parsed = JSON.parse(jsonString);
      
      console.log('✅ Successfully parsed AI response');
      return {
        academicPlan: parsed.academicPlan || {
          currentYear: [],
          nextYear: [],
          longTerm: []
        },
        localJobs: localJobs, // Use the jobs passed in
        careerPathway: parsed.careerPathway || this.getDefaultCareerPathway(careerMatches),
        skillGaps: parsed.skillGaps || this.getDefaultSkillGaps(careerMatches),
        actionItems: parsed.actionItems || this.getDefaultActionItems(profile)
      };
      
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.log('🔍 Raw response sample:', aiResponse.substring(0, 200));
      
      // Try one more time with a simpler approach - extract just the parts we need
      try {
        const simpleExtraction = await this.extractSimpleRecommendations(aiResponse, profile, careerMatches, zipCode);
        if (simpleExtraction) {
          console.log('✅ Successfully extracted simple recommendations from AI response');
          return {
            localJobs: localJobs, // Use the jobs we already fetched
            academicPlan: simpleExtraction.academicPlan || {
              currentYear: [],
              nextYear: [],
              longTerm: []
            },
            careerPathway: (simpleExtraction.careerPathway && 'steps' in simpleExtraction.careerPathway) 
              ? simpleExtraction.careerPathway 
              : {
                  steps: [],
                  timeline: '2-4 years',
                  requirements: []
                },
            skillGaps: simpleExtraction.skillGaps || [],
            actionItems: simpleExtraction.actionItems || []
          };
        }
      } catch (extractError) {
        console.log('⚠️ Simple extraction also failed, using fallback');
      }
    }

    // Final fallback
    console.log('⚠️ Using enhanced fallback recommendations');
    return await this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade, localJobs);
  }

  /**
   * Extract simple recommendations using regex patterns
   */
  private static async extractSimpleRecommendations(
    aiResponse: string,
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string
  ): Promise<Partial<AIRecommendations> | null> {
    try {
      // Extract career pathway steps
      const shortTermMatch = aiResponse.match(/"shortTerm":\s*\[(.*?)\]/);
      const mediumTermMatch = aiResponse.match(/"mediumTerm":\s*\[(.*?)\]/);
      const longTermMatch = aiResponse.match(/"longTerm":\s*\[(.*?)\]/);
      
      const shortTerm = shortTermMatch ? 
        shortTermMatch[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(s => s) :
        ['Complete high school with strong grades'];
      
      const mediumTerm = mediumTermMatch ? 
        mediumTermMatch[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(s => s) :
        ['Pursue relevant training or education'];
      
      const longTerm = longTermMatch ? 
        longTermMatch[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(s => s) :
        ['Enter chosen career field'];
      
      return {
        academicPlan: {
          currentYear: [],
          nextYear: [],
          longTerm: []
        },
        careerPathway: {
          steps: [...shortTerm, ...mediumTerm, ...longTerm],
          timeline: '2-4 years',
          requirements: []
        },
        skillGaps: this.getDefaultSkillGaps(careerMatches),
        actionItems: this.getDefaultActionItems(profile)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate local job opportunities using RealJobProvider (Adzuna API)
   */
  private static async generateLocalJobOpportunities(
    careerMatches: CareerMatch[],
    zipCode: string
  ): Promise<LocalJobOpportunity[]> {
    try {
      console.log('🔍 Fetching real job opportunities from Adzuna API...');
      
      // Check if RealJobProvider is enabled
      if (!RealJobProvider.isEnabled()) {
        console.log('⚠️ RealJobProvider not configured, using simulated jobs');
        return this.generateSimulatedJobs(careerMatches, zipCode);
      }

      const localJobs: LocalJobOpportunity[] = [];

      // Get job opportunities for each career match
      for (const match of careerMatches.slice(0, 3)) { // Top 3 career matches
        try {
          const jobs = await RealJobProvider.searchJobs({
            careerTitle: match.career.title,
            zipCode: zipCode,
            radiusMiles: 25,
            limit: 3 // Max 3 jobs per career
          });

          // Convert RealJobProvider jobs to LocalJobOpportunity format
          jobs.forEach(job => {
            localJobs.push({
              title: job.title,
              company: job.company,
              location: job.location,
              distance: job.distanceFromStudent || this.calculateDistance(zipCode, job.location),
              salary: job.salary || 'Salary not specified',
              requirements: job.requirements || this.extractRequirements(job.description),
              description: job.description.substring(0, 200) + '...',
              source: 'Adzuna Job Search',
              url: job.applicationUrl,
              posted: job.postedDate,
              category: match.career.sector
            });
          });

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Failed to get jobs for ${match.career.title}:`, error);
          // Continue with other careers even if one fails
        }
      }

      console.log(`✅ Found ${localJobs.length} real job opportunities from Adzuna`);
      
      // If we got jobs, return them; otherwise fall back to simulated
      if (localJobs.length > 0) {
        return localJobs.slice(0, 10); // Limit to top 10 jobs
      } else {
        console.log('⚠️ No jobs found from Adzuna, using simulated jobs');
        return this.generateSimulatedJobs(careerMatches, zipCode);
      }

    } catch (error) {
      console.error('❌ Error fetching jobs from RealJobProvider:', error);
      console.log('🔄 Falling back to simulated job opportunities');
      return this.generateSimulatedJobs(careerMatches, zipCode);
    }
  }

  /**
   * Generate simulated job opportunities (fallback)
   */
  private static generateSimulatedJobs(
    careerMatches: CareerMatch[],
    zipCode: string
  ): LocalJobOpportunity[] {
    const jobs: LocalJobOpportunity[] = [];
    
    careerMatches.slice(0, 5).forEach((match, index) => {
      // Simulate local job opportunities
      const baseDistance = 15 + (index * 8); // 15-39 miles
      const distance = Math.min(baseDistance, 40); // Cap at 40 miles
      
      jobs.push({
        title: match.career.title,
        company: `Local ${match.career.sector === 'healthcare' ? 'Hospital' : 'Company'} ${index + 1}`,
        location: `${distance} miles from ZIP ${zipCode}`,
        distance,
        salary: `$${Math.round(match.career.averageSalary * 0.8 / 1000)}k - $${Math.round(match.career.averageSalary * 1.2 / 1000)}k`,
        requirements: match.career.certifications || ['High school diploma'],
        description: `Entry-level ${match.career.title} position with growth opportunities (${match.matchScore}% match)`,
        source: 'Local job market analysis'
      });
    });

    return jobs.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Fallback recommendations when AI is not available
   */
  private static async generateFallbackRecommendations(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number,
    localJobs?: LocalJobOpportunity[]
  ): Promise<AIRecommendations> {
    const grade = currentGrade || 11;
    const isHealthcareInterested = profile.interests?.includes('Healthcare') || 
                                  careerMatches[0]?.career.sector === 'healthcare';
    
    return {
      academicPlan: {
        currentYear: this.getRelevantCourses(grade, isHealthcareInterested, 'current'),
        nextYear: this.getRelevantCourses(grade + 1, isHealthcareInterested, 'next'),
        longTerm: this.getRelevantCourses(grade + 2, isHealthcareInterested, 'longterm')
      },
      localJobs: localJobs || await this.generateLocalJobOpportunities(careerMatches, zipCode),
      careerPathway: this.getDefaultCareerPathway(careerMatches),
      skillGaps: this.getDefaultSkillGaps(careerMatches),
      actionItems: this.getDefaultActionItems(profile)
    };
  }

  /**
   * Get relevant courses based on career interests
   */
  private static getRelevantCourses(
    grade: number,
    isHealthcareInterested: boolean,
    timeframe: 'current' | 'next' | 'longterm'
  ): CourseRecommendation[] {
    const courses: CourseRecommendation[] = [];
    
    if (grade <= 12) {
      // High school courses
      if (isHealthcareInterested) {
        courses.push(
          {
            courseCode: 'BIO101',
            courseName: 'Biology',
            description: 'Essential foundation for healthcare careers',
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'CHEM101',
            courseName: 'Chemistry',
            description: 'Required for nursing and medical programs',
            credits: 1,
            prerequisites: ['BIO101'],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'MATH102',
            courseName: 'Algebra II',
            description: 'Needed for dosage calculations and statistics',
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'medium'
          }
        );
      } else {
        // Infrastructure/trades focus
        courses.push(
          {
            courseCode: 'MATH201',
            courseName: 'Geometry',
            description: 'Essential for construction and electrical work',
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'TECH101',
            courseName: 'Shop/Industrial Arts',
            description: 'Hands-on experience with tools and materials',
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          }
        );
      }
    }

    return courses;
  }

  /**
   * Default career pathway
   */
  private static getDefaultCareerPathway(careerMatches: CareerMatch[]) {
    const topCareer = careerMatches[0]?.career;
    if (!topCareer) {
      return {
        steps: ['Complete high school', 'Explore career options', 'Pursue relevant training or education', 'Enter chosen career field'],
        timeline: '2-4 years',
        requirements: ['High school diploma']
      };
    }

    const steps = [
      'Complete high school with strong grades',
      `Research ${topCareer.title} requirements`,
      'Gain relevant experience through volunteering',
      `Complete ${topCareer.requiredEducation} program`,
      `Obtain required certifications: ${topCareer.certifications?.join(', ') || 'None specified'}`,
      'Apply for entry-level positions',
      'Gain experience and additional certifications',
      'Consider advancement or specialization opportunities'
    ];

    return {
      steps,
      timeline: '2-4 years',
      requirements: [topCareer.requiredEducation, ...(topCareer.certifications || [])]
    };
  }

  /**
   * Default skill gaps
   */
  private static getDefaultSkillGaps(careerMatches: CareerMatch[]) {
    const topCareer = careerMatches[0]?.career;
    const skillGaps = [
      {
        skill: 'Communication',
        importance: 'Critical' as const,
        howToAcquire: 'Join speech/debate club, practice presentations'
      },
      {
        skill: 'Technical Skills',
        importance: 'Important' as const,
        howToAcquire: 'Take relevant courses, online tutorials, hands-on practice'
      }
    ];

    if (topCareer?.sector === 'healthcare') {
      skillGaps.push({
        skill: 'Medical Terminology',
        importance: 'Critical',
        howToAcquire: 'Take health sciences course or online certification'
      });
    }

    return skillGaps;
  }

  /**
   * Default action items
   */
  private static getDefaultActionItems(profile: Partial<StudentProfile>) {
    return [
      {
        title: 'Meet with school counselor',
        description: 'Meet with school counselor to discuss career goals',
        priority: 'high',
        timeline: 'This week'
      },
      {
        title: 'Research training programs',
        description: 'Research local training programs and colleges',
        priority: 'high',
        timeline: 'This month'
      },
      {
        title: 'Find volunteer opportunities',
        description: 'Look for volunteer opportunities in your field of interest',
        priority: 'medium',
        timeline: 'Next month'
      },
      {
        title: 'Network with professionals',
        description: 'Connect with professionals in your chosen field',
        priority: 'medium',
        timeline: 'Next 3 months'
      }
    ];
  }

  /**
   * Get career development notes for assessment answers
   */
  private static getCareerDevelopmentNotes(questionId: string, answer: string | number): string {
    const notes: { [key: string]: { [key: string]: string } } = {
      'interests': {
        'Hands-on Work': 'practical skills, technical training, and applied learning environments',
        'Healthcare': 'interpersonal skills, scientific knowledge, and service-oriented careers',
        'Technology': 'analytical thinking, continuous learning, and digital literacy',
        'Community Impact': 'leadership development, public service, and social responsibility'
      },
      'work_environment': {
        'Outdoors': 'physical stamina, environmental awareness, and field-based careers',
        'Indoors': 'focused concentration, detail-oriented tasks, and office-based skills',
        'Mixed': 'adaptability, versatility, and diverse skill development'
      },
      'education': {
        'certificate': 'hands-on training, immediate job entry, and practical skill focus',
        'associate': 'balanced academic and practical preparation, community college pathway',
        'bachelor': 'comprehensive education, research skills, and professional development'
      }
    };

    const category = notes[questionId];
    if (category && typeof answer === 'string' && category[answer]) {
      return category[answer];
    }
    
    return `specialized skills and knowledge in ${answer}`;
  }

  /**
   * Assess rural viability for career sectors
   */
  private static assessRuralViability(sector: string): string {
    const viability: { [key: string]: string } = {
      'healthcare': 'High - Growing demand due to aging rural populations and healthcare access needs',
      'infrastructure': 'High - Ongoing need for maintenance, utilities, and construction in rural areas',
      'agriculture': 'High - Core rural industry with modern technology integration opportunities',
      'education': 'Moderate - Local schools and community colleges provide stable opportunities',
      'technology': 'Moderate - Remote work opportunities increasing, but may require reliable internet',
      'business': 'Moderate - Small business and entrepreneurship opportunities with lower startup costs',
      'government': 'Moderate - Local government and public service positions available',
      'manufacturing': 'Variable - Depends on local industrial presence and transportation access'
    };

    return viability[sector.toLowerCase()] || 'Variable - Depends on local economic conditions and market demand';
  }

  /**
   * Analyze skill gaps between career requirements and student profile
   */
  private static analyzeSkillGaps(career: any, profile: Partial<StudentProfile>): string {
    const studentSkills = profile.skills || [];
    const careerSector = career.sector?.toLowerCase() || '';
    
    if (careerSector.includes('healthcare')) {
      const healthcareSkills = ['communication', 'empathy', 'attention to detail', 'medical knowledge'];
      const gaps = healthcareSkills.filter(skill => !studentSkills.some(s => s.toLowerCase().includes(skill)));
      return gaps.length > 0 ? `Focus on developing: ${gaps.join(', ')}` : 'Strong skill alignment with healthcare requirements';
    }
    
    if (careerSector.includes('technology')) {
      const techSkills = ['problem-solving', 'analytical thinking', 'technical skills', 'continuous learning'];
      const gaps = techSkills.filter(skill => !studentSkills.some(s => s.toLowerCase().includes(skill)));
      return gaps.length > 0 ? `Develop technical competencies: ${gaps.join(', ')}` : 'Good foundation for technology careers';
    }
    
    return 'Continue developing both technical and soft skills relevant to this career path';
  }

  /**
   * Fix malformed JSON from AI responses
   */
  private static fixMalformedJSON(jsonString: string): string {
    try {
      // Common AI JSON issues and fixes
      let fixed = jsonString
        // Fix incomplete strings (missing closing quotes)
        .replace(/:\s*"([^"]*?)(\s*[,}\]])/g, (match, content, ending) => {
          // If the content doesn't end with a quote, add one
          if (!content.endsWith('"')) {
            return `: "${content}"${ending}`;
          }
          return match;
        })
        // Fix arrays with missing commas
        .replace(/"\s*"([^"]*?)"/g, '", "$1"')
        // Fix objects with missing commas between properties
        .replace(/}(\s*)"([^"]*?)":/g, '}, "$2":')
        // Fix nested objects
        .replace(/}(\s*){/g, '}, {')
        // Remove any trailing text after the last }
        .replace(/}[^}]*$/, '}')
        // Fix boolean values that might be unquoted
        .replace(/:\s*(true|false|null)(\s*[,}\]])/g, ': $1$2')
        // Fix numbers that might have extra characters
        .replace(/:\s*(\d+)[^\d,}\]]*(\s*[,}\]])/g, ': $1$2');
      
      // Try to balance braces and brackets
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      
      // Add missing closing braces
      for (let i = closeBraces; i < openBraces; i++) {
        fixed += '}';
      }
      
      // Add missing closing brackets
      for (let i = closeBrackets; i < openBrackets; i++) {
        fixed += ']';
      }
      
      return fixed;
    } catch (error) {
      console.error('❌ JSON fixing failed:', error);
      return jsonString; // Return original if fixing fails
    }
  }

  /**
   * Get feedback-based improvements for career recommendations
   */
  private static async getFeedbackImprovements(careerMatches: CareerMatch[]): Promise<string[]> {
    try {
      const improvements: string[] = [];
      
      // Get improvement suggestions for top career matches
      for (const match of careerMatches.slice(0, 3)) {
        try {
          // Use onetCode if available, otherwise fall back to career id
          const careerCode = match.career.onetCode || match.career.id;
          const careerImprovements = await FeedbackService.getRecommendationImprovements(careerCode);
          improvements.push(...careerImprovements);
        } catch (error) {
          const careerCode = match.career.onetCode || match.career.id;
          console.log(`⚠️ Could not get feedback improvements for ${careerCode}:`, error);
        }
      }
      
      console.log(`💡 Retrieved ${improvements.length} feedback-based improvements`);
      return improvements;
    } catch (error) {
      console.error('❌ Error getting feedback improvements:', error);
      return [];
    }
  }

  /**
   * Convert ZIP code to location string for Adzuna API
   */
  private static zipCodeToLocation(zipCode: string): string {
    // For now, use ZIP code directly. In production, you might want to:
    // 1. Use a ZIP code to city/state lookup service
    // 2. Cache common ZIP code conversions
    // 3. Handle international postal codes
    
    // Common ZIP code patterns for major areas
    const zipPatterns: { [key: string]: string } = {
      '10': 'New York, NY',
      '11': 'New York, NY', 
      '90': 'Los Angeles, CA',
      '94': 'San Francisco, CA',
      '60': 'Chicago, IL',
      '77': 'Houston, TX',
      '85': 'Phoenix, AZ',
      '19': 'Philadelphia, PA',
      '78': 'San Antonio, TX',
      '92': 'San Diego, CA'
    };

    const prefix = zipCode.substring(0, 2);
    return zipPatterns[prefix] || `ZIP ${zipCode}`;
  }

  /**
   * Calculate approximate distance (simplified)
   */
  private static calculateDistance(zipCode: string, location: string): number {
    // Simplified distance calculation
    // In production, you'd use a proper geocoding service
    
    // Extract any distance information from location string
    const distanceMatch = location.match(/(\d+)\s*miles?/i);
    if (distanceMatch) {
      return parseInt(distanceMatch[1]);
    }
    
    // Default distances based on location patterns
    if (location.includes('Remote')) return 0;
    if (location.includes(zipCode)) return 5;
    if (location.includes('NY') && zipCode.startsWith('1')) return 15;
    if (location.includes('CA') && zipCode.startsWith('9')) return 20;
    
    // Default estimate
    return Math.floor(Math.random() * 30) + 10; // 10-40 miles
  }

  /**
   * Extract job requirements from description
   */
  private static extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    
    // Common requirement patterns
    const patterns = [
      /bachelor'?s degree/i,
      /master'?s degree/i,
      /high school diploma/i,
      /associate degree/i,
      /certification/i,
      /license/i,
      /\d+\+?\s*years?\s*experience/i,
      /experience with \w+/i,
      /knowledge of \w+/i
    ];

    patterns.forEach(pattern => {
      const match = description.match(pattern);
      if (match) {
        requirements.push(match[0]);
      }
    });

    // Default requirements if none found
    if (requirements.length === 0) {
      requirements.push('High school diploma or equivalent');
    }

    return requirements.slice(0, 3); // Limit to 3 requirements
  }
}
