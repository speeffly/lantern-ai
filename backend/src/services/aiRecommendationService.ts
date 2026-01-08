import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudentProfile, AssessmentAnswer, CareerMatch, AIRecommendations, LocalJobOpportunity, CourseRecommendation, Career } from '../types';
import { FeedbackService } from './feedbackService';
import { RealJobProvider } from './realJobProvider';
import { CareerMatchingService, EnhancedCareerMatch } from './careerMatchingService';
import { ParentSummaryService, ParentSummary } from './parentSummaryService';
import { AcademicPlanService, FourYearPlan } from './academicPlanService';

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

      // Fetch jobs once and reuse across all services
      console.log('🔍 Fetching job opportunities once for all services...');
      const sharedJobs = await this.generateLocalJobOpportunities(careerMatches, zipCode);
      console.log(`✅ Fetched ${sharedJobs.length} job opportunities to share across services`);

      // Generate all components in parallel for efficiency, passing shared jobs
      const [
        enhancedCareerMatches,
        counselorRecommendations,
        parentSummary,
        fourYearPlan
      ] = await Promise.all([
        CareerMatchingService.getEnhancedMatches(profile, answers, careerMatches),
        this.generateRecommendations(profile, answers, careerMatches, zipCode, currentGrade, sharedJobs),
        ParentSummaryService.generateParentSummary(profile, answers, careerMatches, currentGrade),
        AcademicPlanService.generateFourYearPlan(profile, answers, careerMatches, zipCode, currentGrade, sharedJobs)
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
    currentGrade?: number,
    preloadedJobs?: LocalJobOpportunity[]
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

      // Use preloaded jobs if available, otherwise fetch them once
      const localJobs = preloadedJobs || await this.generateLocalJobOpportunities(careerMatches, zipCode);
      
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
   * Prepare comprehensive context for AI prompt with enhanced personalization
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
    
    // Create personalized context based on specific user data
    const topCareer = careerMatches[0]?.career;
    const userSpecificContext = this.generateUserSpecificContext(profile, answers, careerMatches);
    
    return `
COMPREHENSIVE STUDENT PROFILE FOR PERSONALIZED CAREER COUNSELING:

CRITICAL PERSONALIZATION REQUIREMENTS:
- This student is UNIQUE with specific interests: ${interests}
- Their skills are: ${skills}
- Their TOP career match is: ${topCareer?.title || 'To be determined'} (${careerMatches[0]?.matchScore || 0}% match)
- Location: ZIP Code ${zipCode} (Rural community)
- Academic Level: Grade ${grade}

IMPORTANT: Provide SPECIFIC, PERSONALIZED recommendations based on THIS STUDENT'S unique profile. 
DO NOT give generic advice. Reference their specific interests, skills, and career matches throughout your response.

STUDENT'S UNIQUE PROFILE ANALYSIS:
${userSpecificContext}

DETAILED INTEREST & PREFERENCE ANALYSIS:
- Primary Interest Areas: ${interests}
- Demonstrated Skills & Strengths: ${skills}
- Preferred Work Environment: ${profile.workEnvironment || 'Mixed indoor/outdoor settings'}
- Collaboration Style: ${profile.teamPreference || 'Comfortable with both team and individual work'}
- Educational Commitment Level: ${profile.educationGoal || 'Open to certificate through associate degree programs'}

PERSONALIZED ASSESSMENT INSIGHTS:
${answers.map((answer, index) => {
  const interpretation = this.interpretAssessmentAnswer(answer.questionId, answer.answer);
  const personalizedInsight = this.getPersonalizedInsight(answer.questionId, answer.answer, topCareer);
  return `${index + 1}. Question: ${answer.questionId}
   → Student's Answer: "${answer.answer}"
   → Personal Insight: ${interpretation}
   → Career Connection: ${personalizedInsight}
   → Specific Recommendation: ${this.getSpecificRecommendation(answer.questionId, answer.answer, topCareer)}`;
}).join('\n\n')}

TOP CAREER MATCHES - PERSONALIZED ANALYSIS FOR THIS STUDENT:
${careerMatches.slice(0, 3).map((match, index) => {
  const personalizedReasoning = this.getPersonalizedCareerReasoning(match, profile, answers);
  return `${index + 1}. ${match.career.title} (${match.matchScore}% match - PERFECT for this student because ${personalizedReasoning})
   - Why this fits ${profile.interests?.[0] || 'their interests'}: ${this.explainCareerFit(match.career, profile)}
   - Salary: ${match.career.averageSalary.toLocaleString()} (${this.getSalaryContext(match.career.averageSalary, zipCode)})
   - Education Path: ${match.career.requiredEducation} (${this.getEducationAdvice(match.career.requiredEducation, grade)})
   - Local Demand: ${match.localDemand} (${this.getLocalDemandAdvice(match.localDemand, zipCode)})
   - Next Steps for THIS student: ${this.getPersonalizedNextSteps(match.career, profile, grade)}`;
}).join('\n\n')}

REAL JOB MARKET ANALYSIS - SPECIFIC TO THIS STUDENT'S INTERESTS:
${realJobs && realJobs.length > 0 ? 
  `Based on live job data, here are opportunities that match ${interests} in ${zipCode}:

${realJobs.slice(0, 5).map((job, index) => {
  const relevanceScore = this.calculateJobRelevance(job, profile, careerMatches);
  return `${index + 1}. ${job.title} at ${job.company} (${relevanceScore}% relevant to this student)
   - Why perfect for ${profile.interests?.[0] || 'this student'}: ${this.explainJobRelevance(job, profile)}
   - Location: ${job.location} (${job.distance} miles - ${this.getCommuteAdvice(job.distance)})
   - Salary: ${job.salary} (${this.compareSalaryToGoals(job.salary, topCareer?.averageSalary)})
   - Requirements: ${job.requirements.join(', ')}
   - Specific advice for this student: ${this.getJobApplicationAdvice(job, profile, grade)}`;
}).join('\n\n')}

PERSONALIZED MARKET INSIGHTS:
- Jobs matching ${interests}: ${realJobs.length} found
- Best opportunities for someone with ${skills}: ${this.identifyBestOpportunities(realJobs, profile)}
- Recommended application strategy: ${this.getApplicationStrategy(realJobs, profile, grade)}` :
  `Real job data not available for ${zipCode}. Focus on preparing this student for ${topCareer?.title || 'their chosen career'} through education and skill development.`
}

FEEDBACK-BASED PERSONALIZATION:
${feedbackImprovements && feedbackImprovements.length > 0 ? 
  `Based on feedback from students with similar interests in ${interests}, incorporate these specific improvements:
${feedbackImprovements.map((improvement, index) => `${index + 1}. ${improvement} (specifically relevant to ${topCareer?.title || 'their career goals'})`).join('\n')}` :
  `No specific feedback available yet. Provide comprehensive baseline recommendations tailored to ${interests} and ${topCareer?.title || 'their career interests'}.`
}

MANDATORY PERSONALIZATION REQUIREMENTS:
1. Reference the student's specific interests (${interests}) in EVERY recommendation
2. Connect advice to their top career match (${topCareer?.title || 'their goals'})
3. Consider their grade level (${grade}) and location (${zipCode})
4. Provide SPECIFIC course names, not generic categories
5. Give ACTIONABLE steps, not vague suggestions
6. Explain WHY each recommendation fits THIS specific student

CRITICAL CAREER PATHWAY REQUIREMENTS:
- Career pathway steps must be SPECIFIC to ${topCareer?.title || 'their chosen career'}
- Each step should reference the actual career title and sector
- Include specific education requirements for ${topCareer?.title || 'their career'}
- Mention specific certifications needed for ${topCareer?.title || 'their field'}
- Timeline should be realistic for ${topCareer?.requiredEducation || 'their education level'}
- Steps should be actionable and measurable, not generic advice
- EXAMPLE: Instead of "Step 1: Complete high school", use "Complete high school with focus on Biology and Chemistry courses for Registered Nurse career"
- EXAMPLE: Instead of "Step 2: Get training", use "Complete 2-year Associate Degree in Nursing (ADN) program at local community college"
- EXAMPLE: Instead of "Step 3: Get certified", use "Pass NCLEX-RN exam to obtain Registered Nurse license"
- MANDATORY: Replace ALL placeholder text like [SPECIFIC CAREER TITLE] with actual career information from student's profile
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

    const systemPrompt = `You are Alex Johnson, a modern career coach specializing in technology and entrepreneurship for Gen Z students.`;

    const userPrompt = `${context}

As Alex Johnson, provide innovative career guidance for this high school student. Focus on emerging opportunities, technology careers, and entrepreneurial pathways.

IMPORTANT: Respond with ONLY valid JSON. Do not include any text before or after the JSON object. Ensure all strings are properly quoted and all objects/arrays are properly closed.

CRITICAL: Replace ALL placeholder text in brackets with actual specific information:
- [SPECIFIC COURSES FOR THIS CAREER] → actual course names like "Biology, Chemistry, Health Sciences"
- [SPECIFIC EDUCATION/TRAINING] → actual program like "2-year Associate Degree in Nursing"
- [SPECIFIC CAREER TITLE] → actual career like "Registered Nurse" or "Electrician"
- [SPECIFIC CERTIFICATIONS] → actual certifications like "NCLEX-RN license" or "Electrical Apprenticeship"
- [SPECIFIC CAREER SECTOR] → actual sector like "healthcare" or "construction trades"
- [SPECIFIC TIMEFRAME] → actual timeline like "4-5 years" or "2-3 years"
- [SPECIFIC EDUCATION LEVEL] → actual requirement like "Associate degree" or "Certificate program"
- [SPECIFIC SKILLS] → actual skills like "Patient care" or "Electrical wiring"

Provide your analysis in the following JSON format:

{
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Specific course name",
        "reasoning": "Why this course is essential for future careers",
        "careerConnection": "How this connects to emerging opportunities",
        "skillsDeveloped": ["skill1", "skill2", "skill3"],
        "priority": "Essential"
      }
    ],
    "nextYear": [],
    "longTerm": []
  },
  "careerPathway": {
    "steps": [
      "Complete high school with focus on [SPECIFIC COURSES FOR THIS CAREER]",
      "Pursue [SPECIFIC EDUCATION/TRAINING] for [SPECIFIC CAREER TITLE]",
      "Obtain [SPECIFIC CERTIFICATIONS] required for [SPECIFIC CAREER TITLE]",
      "Apply for entry-level [SPECIFIC CAREER TITLE] positions",
      "Build experience and advance in [SPECIFIC CAREER SECTOR]"
    ],
    "timeline": "[SPECIFIC TIMEFRAME] based on education requirements",
    "requirements": ["[SPECIFIC EDUCATION LEVEL]", "[SPECIFIC CERTIFICATIONS]", "[SPECIFIC SKILLS]"]
  },
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "Critical",
      "howToAcquire": "How to develop this skill"
    }
  ],
  "actionItems": [
    {
      "title": "Action title",
      "description": "Detailed description",
      "priority": "high",
      "timeline": "When to complete"
    }
  ]
}`;

    console.log('🚀 Sending request to Gemini...');

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = result.response.text();
    
    console.log('✅ GEMINI API RESPONSE RECEIVED');
    console.log('Response Length:', response.length, 'characters');

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

    const systemPrompt = `You are Alex Johnson, a modern career coach specializing in technology and entrepreneurship for Gen Z students.`;

    const userPrompt = `${context}

As Alex Johnson, provide comprehensive career guidance for this rural high school student.

IMPORTANT: Respond with ONLY valid JSON. Do not include any text before or after the JSON object. Ensure all strings are properly quoted and all objects/arrays are properly closed.

CRITICAL: Replace ALL placeholder text in brackets with actual specific information:
- [SPECIFIC COURSES FOR THIS CAREER] → actual course names like "Biology, Chemistry, Health Sciences"
- [SPECIFIC EDUCATION/TRAINING] → actual program like "2-year Associate Degree in Nursing"
- [SPECIFIC CAREER TITLE] → actual career like "Registered Nurse" or "Electrician"
- [SPECIFIC CERTIFICATIONS] → actual certifications like "NCLEX-RN license" or "Electrical Apprenticeship"
- [SPECIFIC CAREER SECTOR] → actual sector like "healthcare" or "construction trades"
- [SPECIFIC TIMEFRAME] → actual timeline like "4-5 years" or "2-3 years"
- [SPECIFIC EDUCATION LEVEL] → actual requirement like "Associate degree" or "Certificate program"
- [SPECIFIC SKILLS] → actual skills like "Patient care" or "Electrical wiring"

Provide your analysis in the following JSON format:

{
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Specific course name",
        "reasoning": "Why this course is essential",
        "careerConnection": "How this connects to career goals",
        "skillsDeveloped": ["skill1", "skill2", "skill3"],
        "priority": "Essential"
      }
    ],
    "nextYear": [],
    "longTerm": []
  },
  "careerPathway": {
    "steps": [
      "Complete high school with focus on [SPECIFIC COURSES FOR THIS CAREER]",
      "Pursue [SPECIFIC EDUCATION/TRAINING] for [SPECIFIC CAREER TITLE]",
      "Obtain [SPECIFIC CERTIFICATIONS] required for [SPECIFIC CAREER TITLE]",
      "Apply for entry-level [SPECIFIC CAREER TITLE] positions",
      "Build experience and advance in [SPECIFIC CAREER SECTOR]"
    ],
    "timeline": "[SPECIFIC TIMEFRAME] based on education requirements",
    "requirements": ["[SPECIFIC EDUCATION LEVEL]", "[SPECIFIC CERTIFICATIONS]", "[SPECIFIC SKILLS]"]
  },
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "Critical",
      "howToAcquire": "How to develop this skill"
    }
  ],
  "actionItems": [
    {
      "title": "Action title",
      "description": "Detailed description",
      "priority": "high",
      "timeline": "When to complete"
    }
  ]
}`;

    console.log('🚀 Sending request to OpenAI...');

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
    
    console.log('✅ OPENAI API RESPONSE RECEIVED');
    console.log('Response Length:', response.length, 'characters');

    return response;
  }

  /**
   * Parse AI response into structured recommendations with comprehensive JSON fixing
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
      
      // Use comprehensive JSON fixing
      const cleanedJson = this.fixMalformedJSON(aiResponse);
      console.log('🔍 Cleaned JSON preview:', cleanedJson.substring(0, 300) + '...');
      
      // Parse the cleaned JSON
      const parsed = JSON.parse(cleanedJson);
      
      console.log('✅ Successfully parsed AI response');
      return {
        academicPlan: parsed.academicPlan || {
          currentYear: [],
          nextYear: [],
          longTerm: []
        },
        localJobs: localJobs,
        careerPathway: parsed.careerPathway || this.getPersonalizedCareerPathway(careerMatches, profile.interests || [], currentGrade || 11),
        skillGaps: parsed.skillGaps || this.getPersonalizedSkillGaps(careerMatches, profile.interests || [], profile.skills || []),
        actionItems: parsed.actionItems || this.getPersonalizedActionItems(profile, careerMatches, currentGrade || 11)
      };
      
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.log('🔍 Raw response sample:', aiResponse.substring(0, 200));
      
      // Progressive fallback strategies
      console.log('🔄 Attempting progressive fallback strategies...');
      
      // Strategy 1: Try to extract just academic plan
      try {
        const academicPlanOnly = this.extractAcademicPlanOnly(aiResponse);
        if (academicPlanOnly) {
          console.log('✅ Successfully extracted academic plan only');
          return {
            localJobs: localJobs,
            academicPlan: academicPlanOnly,
            careerPathway: this.getPersonalizedCareerPathway(careerMatches, profile.interests || [], currentGrade || 11),
            skillGaps: this.getPersonalizedSkillGaps(careerMatches, profile.interests || [], profile.skills || []),
            actionItems: this.getPersonalizedActionItems(profile, careerMatches, currentGrade || 11)
          };
        }
      } catch (extractError) {
        console.log('⚠️ Academic plan extraction failed');
      }
      
      // Strategy 2: Try simple text extraction
      try {
        const simpleExtraction = await this.extractSimpleRecommendations(aiResponse, profile, careerMatches, zipCode);
        if (simpleExtraction) {
          console.log('✅ Successfully extracted simple recommendations from AI response');
          return {
            localJobs: localJobs,
            academicPlan: simpleExtraction.academicPlan || { currentYear: [], nextYear: [], longTerm: [] },
            careerPathway: (simpleExtraction.careerPathway && 'steps' in simpleExtraction.careerPathway) 
              ? simpleExtraction.careerPathway 
              : { steps: [], timeline: '2-4 years', requirements: [] },
            skillGaps: simpleExtraction.skillGaps || this.getPersonalizedSkillGaps(careerMatches, profile.interests || [], profile.skills || []),
            actionItems: simpleExtraction.actionItems || this.getPersonalizedActionItems(profile, careerMatches, currentGrade || 11)
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
   * Extract academic plan only from malformed AI response
   */
  private static extractAcademicPlanOnly(aiResponse: string): any | null {
    try {
      console.log('🔧 Attempting to extract academic plan only...');
      
      // Try to find the academicPlan section
      const academicPlanMatch = aiResponse.match(/"academicPlan"\s*:\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/);
      if (academicPlanMatch) {
        const academicPlanJson = `{${academicPlanMatch[0]}}`;
        const parsed = JSON.parse(academicPlanJson);
        return parsed.academicPlan;
      }
      
      // Alternative: try to extract currentYear, nextYear, longTerm arrays
      const currentYearMatch = aiResponse.match(/"currentYear"\s*:\s*\[[^\]]*\]/);
      const nextYearMatch = aiResponse.match(/"nextYear"\s*:\s*\[[^\]]*\]/);
      const longTermMatch = aiResponse.match(/"longTerm"\s*:\s*\[[^\]]*\]/);
      
      if (currentYearMatch || nextYearMatch || longTermMatch) {
        const academicPlan: any = {
          currentYear: [],
          nextYear: [],
          longTerm: []
        };
        
        if (currentYearMatch) {
          try {
            const currentYearJson = `{"currentYear":${currentYearMatch[0].split(':')[1]}}`;
            const parsed = JSON.parse(currentYearJson);
            academicPlan.currentYear = parsed.currentYear;
          } catch (error) {
            console.log('⚠️ Failed to parse currentYear array');
          }
        }
        
        if (nextYearMatch) {
          try {
            const nextYearJson = `{"nextYear":${nextYearMatch[0].split(':')[1]}}`;
            const parsed = JSON.parse(nextYearJson);
            academicPlan.nextYear = parsed.nextYear;
          } catch (error) {
            console.log('⚠️ Failed to parse nextYear array');
          }
        }
        
        if (longTermMatch) {
          try {
            const longTermJson = `{"longTerm":${longTermMatch[0].split(':')[1]}}`;
            const parsed = JSON.parse(longTermJson);
            academicPlan.longTerm = parsed.longTerm;
          } catch (error) {
            console.log('⚠️ Failed to parse longTerm array');
          }
        }
        
        return academicPlan;
      }
      
      return null;
    } catch (error) {
      console.log('⚠️ Academic plan extraction failed:', error);
      return null;
    }
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
        skillGaps: this.getPersonalizedSkillGaps(careerMatches, profile.interests || [], profile.skills || []),
        actionItems: this.getPersonalizedActionItems(profile, careerMatches, 11)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Fix malformed JSON from AI responses with comprehensive error handling
   */
  private static fixMalformedJSON(aiResponse: string): string {
    try {
      console.log('🔧 Starting comprehensive JSON cleanup...');
      
      // Step 1: Initial cleanup
      let cleaned = aiResponse
        // Remove markdown code blocks
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        // Remove any text before the first {
        .replace(/^[^{]*/, '')
        // Remove any text after the last }
        .replace(/}[^}]*$/, '}')
        // Remove control characters but preserve structure
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();

      // Step 2: Extract JSON more carefully
      let jsonStart = cleaned.indexOf('{');
      let jsonEnd = cleaned.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
        throw new Error('No valid JSON structure found');
      }
      
      let jsonString = cleaned.substring(jsonStart, jsonEnd + 1);
      
      // Step 3: Fix common JSON issues that cause parsing errors
      jsonString = jsonString
        // CRITICAL FIX: Remove leading commas after opening braces (main issue causing the error)
        .replace(/{\s*,+\s*/g, '{')
        .replace(/\[\s*,+\s*/g, '[')
        // Fix specific pattern that AI generates: {, "property"
        .replace(/{\s*,\s*"/g, '{"')
        .replace(/\[\s*,\s*"/g, '["')
        // Fix leading commas at start of lines
        .replace(/^\s*,/gm, '')
        // Fix missing quotes around property names
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix multiple consecutive commas
        .replace(/,\s*,+/g, ',')
        // Fix missing commas between properties (most common issue)
        .replace(/"\s*\n\s*"/g, '",\n"')
        .replace(/}\s*\n\s*"/g, '},\n"')
        .replace(/]\s*\n\s*"/g, '],\n"')
        .replace(/([^,}\]]\s*)(\s*"[^"]*"\s*:)/g, '$1,$2')
        // Fix unescaped quotes in strings
        .replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":')
        // Fix boolean and null values
        .replace(/:\s*(true|false|null)(\s*[,}\]])/gi, ': $1$2')
        // Fix numbers with extra characters
        .replace(/:\s*(\d+(?:\.\d+)?)[^\d,}\]\s]*(\s*[,}\]])/g, ': $1$2')
        // Fix incomplete strings at end of properties
        .replace(/:\s*"([^"]*?)(\s*[,}\]])/g, (match, content, ending) => {
          if (content && !content.includes('"')) {
            return `: "${content}"${ending}`;
          }
          return match;
        })
        // Fix escaped backslashes in strings that break JSON
        .replace(/\\\\/g, '\\')
        // Fix newlines in strings
        .replace(/"\s*\n\s*([^"]*?)"/g, '"$1"');

      // Step 4: Advanced fixes for specific patterns
      jsonString = jsonString
        // Fix array elements without commas
        .replace(/}\s*{/g, '},{')
        .replace(/]\s*\[/g, '],[')
        // Fix missing commas after array elements
        .replace(/}\s*]/g, '}]')
        .replace(/"\s*]/g, '"]')
        // Fix property names that got corrupted
        .replace(/\\"/g, '\\"')
        // Remove any remaining leading/trailing commas
        .replace(/^,+|,+$/g, '');

      // Step 5: Balance braces and brackets
      const openBraces = (jsonString.match(/{/g) || []).length;
      const closeBraces = (jsonString.match(/}/g) || []).length;
      const openBrackets = (jsonString.match(/\[/g) || []).length;
      const closeBrackets = (jsonString.match(/\]/g) || []).length;
      
      // Add missing closing braces
      for (let i = closeBraces; i < openBraces; i++) {
        jsonString += '}';
      }
      
      // Add missing closing brackets
      for (let i = closeBrackets; i < openBrackets; i++) {
        jsonString += ']';
      }

      // Step 6: Try to parse and fix specific errors iteratively
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          JSON.parse(jsonString);
          console.log(`✅ JSON cleanup successful after ${attempts + 1} attempt(s)`);
          return jsonString;
        } catch (parseError) {
          attempts++;
          console.log(`🔧 Parse attempt ${attempts} failed, applying targeted fixes...`);
          
          if (parseError instanceof SyntaxError) {
            const errorMessage = parseError.message;
            
            // Fix specific error: Expected property name or '}'
            if (errorMessage.includes("Expected property name or '}'")) {
              console.log('   🔧 Fixing leading comma issue more aggressively...');
              // More aggressive leading comma removal
              jsonString = jsonString
                .replace(/{\s*,+/g, '{')
                .replace(/,\s*}/g, '}')
                .replace(/,\s*,+/g, ',')
                // Fix specific pattern: {, "property"
                .replace(/{\s*,\s*"/g, '{"')
                // Fix pattern: [, "item"
                .replace(/\[\s*,\s*"/g, '["')
                // Remove commas at start of lines
                .replace(/^\s*,/gm, '')
                // Remove commas immediately after opening braces with any whitespace
                .replace(/{\s*,+\s*/g, '{')
                .replace(/\[\s*,+\s*/g, '[');
            }
            
            // Fix specific error: Expected ',' or '}' after property value
            if (errorMessage.includes("Expected ',' or '}'")) {
              const positionMatch = errorMessage.match(/position (\d+)/);
              if (positionMatch) {
                const position = parseInt(positionMatch[1]);
                const beforeError = jsonString.substring(0, position);
                const afterError = jsonString.substring(position);
                
                // Try to fix the specific position
                if (afterError.match(/^\s*"/)) {
                  // Missing comma before next property
                  jsonString = beforeError + ',' + afterError;
                } else if (afterError.match(/^\s*}/)) {
                  // Extra content before closing brace - remove it
                  const cleanAfter = afterError.replace(/^[^"}]*/, '');
                  jsonString = beforeError + cleanAfter;
                }
              } else {
                // General fix for missing commas
                jsonString = jsonString
                  .replace(/([^,}\]]\s*)(\s*"[^"]*"\s*:)/g, '$1,$2')
                  .replace(/,\s*,/g, ',');
              }
            }
            
            // Fix specific error: Expected ',' or ']' after array element
            if (errorMessage.includes("Expected ',' or ']'")) {
              jsonString = jsonString
                .replace(/([^,\]]\s*)(\s*[{\[])/g, '$1,$2')
                .replace(/,\s*,/g, ',');
            }
            
            // Fix specific error: Unexpected token
            if (errorMessage.includes('Unexpected token')) {
              jsonString = jsonString
                .replace(/([^",}\]]\s+)(["{])/g, '$1,$2')
                .replace(/,\s*,/g, ',')
                .replace(/{\s*,/g, '{')
                .replace(/\[\s*,/g, '[');
            }
          }
        }
      }
      
      console.log('⚠️ JSON cleanup partially successful, may have remaining issues');
      return jsonString;
      
    } catch (error) {
      console.error('❌ JSON cleanup failed:', error);
      
      // Last resort: try to extract just the academic plan section
      try {
        const academicPlanMatch = aiResponse.match(/"academicPlan"\s*:\s*\{[^}]*\}/);
        if (academicPlanMatch) {
          console.log('🔄 Extracting academic plan only as fallback');
          return `{${academicPlanMatch[0]}}`;
        }
      } catch (extractError) {
        console.log('⚠️ Even academic plan extraction failed');
      }
      
      // Return a minimal valid JSON structure
      console.log('🔄 Returning minimal valid JSON structure');
      return '{"academicPlan":{"currentYear":[],"nextYear":[],"longTerm":[]},"careerPathway":{"steps":[],"timeline":"2-4 years","requirements":[]},"skillGaps":[],"actionItems":[]}';
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
        company: this.getCompanyNameBySector(match.career.sector, index + 1),
        location: `${distance} miles from ZIP ${zipCode}`,
        distance,
        salary: `${Math.round(match.career.averageSalary * 0.8 / 1000)}k - ${Math.round(match.career.averageSalary * 1.2 / 1000)}k`,
        requirements: match.career.certifications || ['High school diploma'],
        description: `Entry-level ${match.career.title} position with growth opportunities (${match.matchScore}% match)`,
        source: 'Local job market analysis'
      });
    });

    return jobs.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Enhanced fallback recommendations with personalization when AI is not available
   */
  private static async generateFallbackRecommendations(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number,
    localJobs?: LocalJobOpportunity[]
  ): Promise<AIRecommendations> {
    const grade = currentGrade || 11;
    const interests = profile.interests || [];
    const skills = profile.skills || [];
    const topCareer = careerMatches[0]?.career;
    
    console.log('🔄 Generating personalized fallback recommendations for:', {
      interests: interests.join(', '),
      topCareer: topCareer?.title,
      grade,
      zipCode
    });
    
    // Determine primary interest areas for personalization across all sectors
    const sectorInterests = this.mapInterestsToSectors(interests, topCareer?.sector);
    
    console.log('🔄 Sector interests mapping:', sectorInterests);
    
    return {
      academicPlan: {
        currentYear: this.getPersonalizedCourses(grade, interests, topCareer, 'current'),
        nextYear: this.getPersonalizedCourses(grade + 1, interests, topCareer, 'next'),
        longTerm: this.getPersonalizedCourses(grade + 2, interests, topCareer, 'longterm')
      },
      localJobs: localJobs || await this.generateLocalJobOpportunities(careerMatches, zipCode),
      careerPathway: this.getPersonalizedCareerPathway(careerMatches, interests, grade),
      skillGaps: this.getPersonalizedSkillGaps(careerMatches, interests, skills),
      actionItems: this.getPersonalizedActionItems(profile, careerMatches, grade)
    };
  }

  /**
   * Get personalized courses based on student's specific interests and career goals
   */
  private static getPersonalizedCourses(
    grade: number,
    interests: string[],
    topCareer: Career | undefined,
    timeframe: 'current' | 'next' | 'longterm'
  ): CourseRecommendation[] {
    const courses: CourseRecommendation[] = [];
    
    if (grade <= 12) {
      // Healthcare-focused courses
      if (interests.includes('Healthcare') || topCareer?.sector === 'healthcare') {
        courses.push(
          {
            courseCode: 'BIO101',
            courseName: 'Advanced Biology',
            description: `Essential for healthcare careers - learn human anatomy and physiology`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'CHEM101',
            courseName: 'Chemistry',
            description: `Required for nursing and medical programs - understand drug interactions and body chemistry`,
            credits: 1,
            prerequisites: ['BIO101'],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'HEALTH101',
            courseName: 'Health Sciences',
            description: `Direct preparation for healthcare careers - medical terminology and patient care basics`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          }
        );
      }
      
      // Hands-on/Infrastructure courses
      if (interests.includes('Hands-on Work') || topCareer?.sector === 'infrastructure') {
        courses.push(
          {
            courseCode: 'SHOP101',
            courseName: 'Industrial Arts/Shop Class',
            description: `Perfect for construction and trades - hands-on experience with tools and materials`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'MATH201',
            courseName: 'Geometry & Trigonometry',
            description: `Essential for construction and electrical work - calculate angles, measurements, and blueprints`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'PHYS101',
            courseName: 'Physics',
            description: `Important for engineering and trades - understand forces, electricity, and mechanics`,
            credits: 1,
            prerequisites: ['MATH201'],
            provider: 'High School',
            semester: 'Both',
            priority: 'medium'
          }
        );
      }
      
      // Technology courses
      if (interests.includes('Technology') || topCareer?.sector === 'technology') {
        courses.push(
          {
            courseCode: 'CS101',
            courseName: 'Computer Science Fundamentals',
            description: `Great for tech careers - learn programming basics and problem-solving`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'DIGI101',
            courseName: 'Digital Media & Design',
            description: `Relevant for technology roles - create digital content and understand user interfaces`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'medium'
          }
        );
      }
      
      // Education courses
      if (interests.includes('Education') || interests.includes('Teaching') || topCareer?.sector === 'education') {
        courses.push(
          {
            courseCode: 'PSYCH101',
            courseName: 'Psychology',
            description: `Essential for education careers - understand how people learn and develop`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'SPEECH101',
            courseName: 'Speech & Communication',
            description: `Critical for teaching roles - develop presentation and communication skills`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          }
        );
      }
      
      // Business & Finance courses
      if (interests.includes('Business') || interests.includes('Finance') || topCareer?.sector === 'business' || topCareer?.sector === 'finance') {
        courses.push(
          {
            courseCode: 'ECON101',
            courseName: 'Economics',
            description: `Important for business careers - understand markets, money, and economic principles`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'ACCT101',
            courseName: 'Accounting/Business Math',
            description: `Essential for finance roles - learn financial record-keeping and analysis`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          }
        );
      }
      
      // Creative courses
      if (interests.includes('Creative') || interests.includes('Art') || topCareer?.sector === 'creative') {
        courses.push(
          {
            courseCode: 'ART101',
            courseName: 'Visual Arts',
            description: `Perfect for creative careers - develop artistic skills and creative thinking`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'MEDIA101',
            courseName: 'Media Arts',
            description: `Great for design roles - learn digital design and multimedia creation`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'medium'
          }
        );
      }
      
      // Science courses (for science sector)
      if (interests.includes('Science') || interests.includes('Research') || topCareer?.sector === 'science') {
        courses.push(
          {
            courseCode: 'CHEM201',
            courseName: 'Advanced Chemistry',
            description: `Essential for science careers - advanced chemical principles and lab techniques`,
            credits: 1,
            prerequisites: ['CHEM101'],
            provider: 'High School',
            semester: 'Both',
            priority: 'high'
          },
          {
            courseCode: 'STAT101',
            courseName: 'Statistics',
            description: `Important for research roles - data analysis and scientific method`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'medium'
          }
        );
      }
      
      // Community Impact/Public Service courses
      if (interests.includes('Community Impact') || interests.includes('Public Service') || topCareer?.sector === 'public-service') {
        courses.push(
          {
            courseCode: 'SOC101',
            courseName: 'Social Studies/Civics',
            description: `Important for public service roles - understand social issues and government`,
            credits: 1,
            prerequisites: [],
            provider: 'High School',
            semester: 'Both',
            priority: 'medium'
          }
        );
      }
      
      // Universal courses that benefit everyone
      courses.push(
        {
          courseCode: 'ENG101',
          courseName: 'English/Communication',
          description: `Critical for any career - improve writing and speaking skills for professional success`,
          credits: 1,
          prerequisites: [],
          provider: 'High School',
          semester: 'Both',
          priority: 'high'
        }
      );
    }

    return courses.slice(0, 4); // Limit to top 4 most relevant courses
  }

  /**
   * Get personalized career pathway based on student's interests
   */
  private static getPersonalizedCareerPathway(careerMatches: CareerMatch[], interests: string[], grade: number) {
    const topCareer = careerMatches[0]?.career;
    const yearsToGraduation = Math.max(0, 12 - grade);
    
    if (!topCareer) {
      return {
        steps: [
          'Complete high school with strong grades',
          `Explore careers related to ${interests.join(' and ')}`,
          'Pursue relevant training or education',
          'Enter chosen career field'
        ],
        timeline: '2-4 years',
        requirements: ['High school diploma']
      };
    }

    const steps = [
      `Complete high school focusing on ${this.getRecommendedCourseFocus(interests, topCareer?.sector)} courses`,
      `Research ${topCareer.title} requirements and local opportunities`,
      `Gain experience through ${this.getExperienceRecommendation(interests, topCareer?.sector, topCareer?.title)}`,
      `Complete ${topCareer.requiredEducation} program focused on ${topCareer.title}`,
      `Obtain required certifications: ${topCareer.certifications?.join(', ') || 'Professional certifications as needed'}`,
      `Apply for entry-level ${topCareer.title} positions in your area`,
      `Build experience and expertise in ${topCareer.title}`,
      `Consider specialization or advancement in ${topCareer.sector} sector`
    ];

    return {
      steps,
      timeline: `${yearsToGraduation + 2}-${yearsToGraduation + 4} years`,
      requirements: [
        'High school diploma',
        topCareer.requiredEducation,
        ...(topCareer.certifications || [])
      ]
    };
  }

  /**
   * Get personalized skill gaps based on interests and career matches
   */
  private static getPersonalizedSkillGaps(careerMatches: CareerMatch[], interests: string[], currentSkills: string[]) {
    const topCareer = careerMatches[0]?.career;
    const skillGaps = [];

    // Always important skills
    if (!currentSkills.includes('Communication')) {
      skillGaps.push({
        skill: 'Communication',
        importance: 'Critical' as const,
        howToAcquire: `Essential for any career - join speech/debate club, practice presentations, work on customer service`
      });
    }

    // Primary skills based on TOP CAREER SECTOR (most important)
    if (topCareer) {
      switch (topCareer.sector) {
        case 'healthcare':
          skillGaps.push({
            skill: 'Medical Terminology',
            importance: 'Critical',
            howToAcquire: `Crucial for healthcare careers - take health sciences course, use medical terminology apps, volunteer at hospitals`
          });
          if (!currentSkills.includes('Empathy')) {
            skillGaps.push({
              skill: 'Patient Care & Empathy',
              importance: 'Critical',
              howToAcquire: `Key for healthcare - volunteer with elderly, practice active listening, take psychology courses`
            });
          }
          break;

        case 'technology':
          skillGaps.push({
            skill: 'Programming/Digital Literacy',
            importance: 'Critical',
            howToAcquire: `Necessary for tech careers - learn Python or JavaScript online, take computer science courses, build projects`
          });
          skillGaps.push({
            skill: 'Analytical Thinking',
            importance: 'Important',
            howToAcquire: `Valuable for technology roles - practice logic puzzles, take math courses, learn data analysis`
          });
          break;

        case 'creative':
          skillGaps.push({
            skill: 'Creative Problem Solving',
            importance: 'Critical',
            howToAcquire: `Essential for creative careers - practice art projects, learn design software, develop portfolio of creative work`
          });
          skillGaps.push({
            skill: 'Visual Design Skills',
            importance: 'Critical',
            howToAcquire: `Key for creative roles - learn Adobe Creative Suite, practice composition and color theory, study design principles`
          });
          break;

        case 'business':
        case 'finance':
          skillGaps.push({
            skill: 'Financial Literacy',
            importance: 'Critical',
            howToAcquire: `Essential for business careers - take economics courses, learn about budgeting and investments, practice with spreadsheets`
          });
          skillGaps.push({
            skill: 'Leadership & Management',
            importance: 'Important',
            howToAcquire: `Valuable for business roles - join student government, lead group projects, practice delegation and team coordination`
          });
          break;

        case 'education':
          skillGaps.push({
            skill: 'Patience & Mentoring',
            importance: 'Critical',
            howToAcquire: `Key for education roles - tutor younger students, volunteer with children, practice explaining concepts clearly`
          });
          skillGaps.push({
            skill: 'Curriculum Development',
            importance: 'Important',
            howToAcquire: `Important for teaching - learn lesson planning, study educational psychology, practice creating learning materials`
          });
          break;

        case 'infrastructure':
        case 'manufacturing':
          skillGaps.push({
            skill: 'Technical/Mechanical Skills',
            importance: 'Critical',
            howToAcquire: `Essential for trades and construction - take shop class, work on DIY projects, find apprenticeships`
          });
          if (!currentSkills.includes('Problem Solving')) {
            skillGaps.push({
              skill: 'Troubleshooting & Problem Solving',
              importance: 'Important',
              howToAcquire: `Important for technical work - practice fixing things, take engineering courses, work on puzzles and challenges`
            });
          }
          break;

        case 'public-service':
          skillGaps.push({
            skill: 'Leadership & Teamwork',
            importance: 'Critical',
            howToAcquire: `Important for public service - join student government, lead volunteer projects, participate in group activities`
          });
          skillGaps.push({
            skill: 'Conflict Resolution',
            importance: 'Important',
            howToAcquire: `Valuable for public service - practice mediation, learn de-escalation techniques, study communication strategies`
          });
          break;

        case 'science':
          skillGaps.push({
            skill: 'Research & Analysis',
            importance: 'Critical',
            howToAcquire: `Essential for science careers - participate in science fairs, learn statistical analysis, practice lab techniques`
          });
          skillGaps.push({
            skill: 'Scientific Method',
            importance: 'Important',
            howToAcquire: `Key for research roles - design experiments, practice hypothesis testing, learn data interpretation`
          });
          break;

        case 'hospitality':
          skillGaps.push({
            skill: 'Customer Service',
            importance: 'Critical',
            howToAcquire: `Essential for hospitality - practice active listening, learn conflict resolution, work in customer-facing roles`
          });
          break;

        case 'agriculture':
          skillGaps.push({
            skill: 'Agricultural Knowledge',
            importance: 'Critical',
            howToAcquire: `Important for farming - learn about crops and livestock, study sustainable practices, gain hands-on farm experience`
          });
          break;

        case 'transportation':
          skillGaps.push({
            skill: 'Safety & Regulations',
            importance: 'Critical',
            howToAcquire: `Essential for transportation - learn DOT regulations, practice safety protocols, study vehicle maintenance`
          });
          break;

        case 'retail':
          skillGaps.push({
            skill: 'Sales & Customer Relations',
            importance: 'Critical',
            howToAcquire: `Key for retail - practice sales techniques, learn product knowledge, develop customer service skills`
          });
          break;

        case 'legal':
          skillGaps.push({
            skill: 'Legal Research',
            importance: 'Critical',
            howToAcquire: `Essential for legal careers - learn case law research, practice legal writing, study court procedures`
          });
          break;
      }
    }

    // Secondary skills from interests (only if they complement the primary career)
    // This prevents technology skills from being recommended for creative careers
    const relevantInterestSkills = this.getRelevantInterestSkills(interests, topCareer?.sector, currentSkills);
    skillGaps.push(...relevantInterestSkills);

    return skillGaps.slice(0, 4); // Limit to top 4 most important skills
  }

  /**
   * Get relevant interest-based skills that complement the primary career
   */
  private static getRelevantInterestSkills(interests: string[], primarySector?: string, currentSkills: string[] = []): any[] {
    const skills = [];

    // Only add interest-based skills if they're relevant to the primary career sector
    // or if there's no clear primary sector
    
    if (!primarySector) {
      // If no primary sector, use interest-based skills as fallback
      if (interests.includes('Technology')) {
        skills.push({
          skill: 'Programming/Digital Literacy',
          importance: 'Important',
          howToAcquire: `Valuable for tech careers - learn Python or JavaScript online, take computer science courses, build projects`
        });
      }
      
      if (interests.includes('Creative')) {
        skills.push({
          skill: 'Creative Problem Solving',
          importance: 'Important',
          howToAcquire: `Valuable for creative careers - practice art projects, learn design software, develop portfolio of creative work`
        });
      }
    } else {
      // Only add complementary skills that make sense for the primary sector
      if (primarySector === 'creative' && interests.includes('Technology')) {
        // Digital skills are relevant for creative careers
        skills.push({
          skill: 'Digital Media Skills',
          importance: 'Important',
          howToAcquire: `Valuable for modern creative work - learn photo editing, video production, digital design tools`
        });
      }
      
      if (primarySector === 'business' && interests.includes('Technology')) {
        // Tech skills are relevant for business careers
        skills.push({
          skill: 'Business Technology',
          importance: 'Important',
          howToAcquire: `Valuable for modern business - learn spreadsheet analysis, database management, business software`
        });
      }
      
      if (['healthcare', 'education', 'public-service'].includes(primarySector) && interests.includes('Community Impact')) {
        // Community skills are relevant for service sectors
        skills.push({
          skill: 'Community Engagement',
          importance: 'Important',
          howToAcquire: `Valuable for service roles - volunteer in community, practice public speaking, learn cultural sensitivity`
        });
      }
    }

    return skills;
  }

  /**
   * Get personalized action items based on student profile
   */
  private static getPersonalizedActionItems(profile: Partial<StudentProfile>, careerMatches: CareerMatch[], grade: number) {
    const topCareer = careerMatches[0]?.career;
    const interests = profile.interests || [];
    const yearsToGraduation = Math.max(0, 12 - grade);
    
    const actionItems = [
      {
        title: `Meet with school counselor about ${topCareer?.title || 'career goals'}`,
        description: `Discuss your interest in ${interests.join(' and ')} and create a plan for ${topCareer?.title || 'your chosen career'}`,
        priority: 'high',
        timeline: 'This week'
      }
    ];

    // PRIORITY 1: Actions based on TOP CAREER SECTOR (most important)
    if (topCareer) {
      switch (topCareer.sector) {
        case 'healthcare':
          actionItems.push(
            {
              title: 'Volunteer at local hospital or clinic',
              description: `Get hands-on experience in healthcare settings to prepare for ${topCareer.title} career`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Shadow a healthcare professional',
              description: `Spend a day with a nurse, doctor, or medical technician to see ${topCareer.title} work firsthand`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        case 'creative':
          actionItems.push(
            {
              title: 'Build a creative portfolio',
              description: `Create a collection of your best work for ${topCareer.title} career - art, design, photography, or multimedia projects`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Enter art competitions or shows',
              description: `Showcase your ${topCareer.title} talents and get feedback from creative professionals`,
              priority: 'medium',
              timeline: 'Next 3 months'
            }
          );
          break;

        case 'technology':
          actionItems.push(
            {
              title: 'Start learning programming online',
              description: `Begin with Python or JavaScript to prepare for ${topCareer.title} career - use free resources like Codecademy`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Join computer science or robotics club',
              description: `Connect with other tech-interested students and work on projects related to ${topCareer.title}`,
              priority: 'medium',
              timeline: 'Next semester'
            }
          );
          break;

        case 'infrastructure':
        case 'manufacturing':
          actionItems.push(
            {
              title: 'Find apprenticeship or internship opportunities',
              description: `Look for hands-on learning in construction, electrical, or mechanical trades for ${topCareer.title} career`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Visit local construction sites or workshops',
              description: `See ${topCareer.title} work in action and talk to professionals about their careers`,
              priority: 'medium',
              timeline: 'Next month'
            }
          );
          break;

        case 'education':
          actionItems.push(
            {
              title: 'Start tutoring younger students',
              description: `Gain teaching experience to prepare for ${topCareer.title} career - volunteer at elementary schools or offer peer tutoring`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Observe different classroom settings',
              description: `Visit various grade levels and teaching environments to understand ${topCareer.title} roles`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        case 'business':
        case 'finance':
          actionItems.push(
            {
              title: 'Join business or entrepreneurship club',
              description: `Develop business skills for ${topCareer.title} career - learn about markets, finance, and leadership`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Find part-time job in retail or customer service',
              description: `Gain real-world business experience relevant to ${topCareer.title} roles`,
              priority: 'medium',
              timeline: 'Next 3 months'
            }
          );
          break;

        case 'science':
          actionItems.push(
            {
              title: 'Participate in science fair or research project',
              description: `Develop research skills for ${topCareer.title} career - design experiments and analyze data`,
              priority: 'high',
              timeline: 'This semester'
            },
            {
              title: 'Contact local research facilities',
              description: `Explore internship opportunities in labs or research centers related to ${topCareer.title} work`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        case 'public-service':
          actionItems.push(
            {
              title: 'Volunteer in community service',
              description: `Gain experience in public service to prepare for ${topCareer.title} career - volunteer with local organizations`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Shadow public service professionals',
              description: `Spend time with police officers, firefighters, or government workers to understand ${topCareer.title} roles`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        case 'agriculture':
          actionItems.push(
            {
              title: 'Visit local farms or agricultural facilities',
              description: `Get hands-on experience in agriculture to prepare for ${topCareer.title} career`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Join FFA or agricultural clubs',
              description: `Connect with others interested in ${topCareer.title} and agricultural careers`,
              priority: 'medium',
              timeline: 'Next semester'
            }
          );
          break;

        case 'transportation':
          actionItems.push(
            {
              title: 'Learn about transportation regulations',
              description: `Study DOT regulations and safety protocols for ${topCareer.title} career`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Visit transportation facilities',
              description: `Tour airports, shipping centers, or logistics companies to understand ${topCareer.title} work`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        case 'hospitality':
          actionItems.push(
            {
              title: 'Find part-time job in hospitality',
              description: `Gain customer service experience to prepare for ${topCareer.title} career - work in restaurants, hotels, or events`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Practice customer service skills',
              description: `Develop communication and problem-solving skills essential for ${topCareer.title} roles`,
              priority: 'medium',
              timeline: 'Next month'
            }
          );
          break;

        case 'retail':
          actionItems.push(
            {
              title: 'Find part-time retail job',
              description: `Gain sales and customer service experience for ${topCareer.title} career`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Learn about product knowledge and sales',
              description: `Develop skills in customer relations and sales techniques for ${topCareer.title} roles`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        case 'legal':
          actionItems.push(
            {
              title: 'Join debate or mock trial team',
              description: `Develop argumentation and legal reasoning skills for ${topCareer.title} career`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: 'Shadow legal professionals',
              description: `Spend time with lawyers, paralegals, or court staff to understand ${topCareer.title} work`,
              priority: 'medium',
              timeline: 'Next 2 months'
            }
          );
          break;

        default:
          // Generic career-specific actions
          actionItems.push(
            {
              title: `Find ${topCareer.title} professionals to shadow`,
              description: `Spend time with people working in ${topCareer.title} to understand the day-to-day work`,
              priority: 'high',
              timeline: 'This month'
            },
            {
              title: `Research ${topCareer.title} requirements`,
              description: `Learn about education, certifications, and skills needed for ${topCareer.title} career`,
              priority: 'medium',
              timeline: 'Next month'
            }
          );
          break;
      }
    } else {
      // PRIORITY 2: Fallback to interest-based actions only if no clear career match
      if (interests.includes('Healthcare')) {
        actionItems.push(
          {
            title: 'Volunteer at local hospital or clinic',
            description: `Get hands-on experience in healthcare settings to explore medical careers`,
            priority: 'high',
            timeline: 'This month'
          }
        );
      }

      if (interests.includes('Hands-on Work')) {
        actionItems.push(
          {
            title: 'Find apprenticeship or internship opportunities',
            description: `Look for hands-on learning in construction, electrical, or mechanical trades`,
            priority: 'high',
            timeline: 'This month'
          }
        );
      }

      if (interests.includes('Technology')) {
        actionItems.push(
          {
            title: 'Start learning programming online',
            description: `Begin with Python or JavaScript to explore tech careers - use free resources like Codecademy`,
            priority: 'high',
            timeline: 'This month'
          }
        );
      }

      if (interests.includes('Creative') || interests.includes('Art')) {
        actionItems.push(
          {
            title: 'Build a creative portfolio',
            description: `Create a collection of your best work to explore creative careers - art, design, writing, or multimedia projects`,
            priority: 'high',
            timeline: 'This month'
          }
        );
      }
    }

    // Universal actions
    actionItems.push(
      {
        title: `Research ${topCareer?.title || 'career'} training programs`,
        description: `Find local colleges, trade schools, or certification programs for ${topCareer?.title || 'your chosen field'}`,
        priority: 'high',
        timeline: yearsToGraduation > 1 ? 'Next 3 months' : 'This month'
      },
      {
        title: `Network with ${topCareer?.title || 'professionals'} in your field`,
        description: `Connect with people working in ${topCareer?.title || 'your area of interest'} through LinkedIn, local events, or family connections`,
        priority: 'medium',
        timeline: 'Next 3 months'
      }
    );

    return actionItems.slice(0, 5); // Limit to top 5 most important actions
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
   * Generate user-specific context for personalization
   */
  private static generateUserSpecificContext(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[]
  ): string {
    const topCareer = careerMatches[0]?.career;
    const interests = profile.interests || [];
    const skills = profile.skills || [];
    
    let context = `This student is uniquely interested in ${interests.join(' and ')}. `;
    
    if (topCareer) {
      context += `Their top career match is ${topCareer.title}, which aligns perfectly with their interests because `;
      
      // Explain the connection between interests and career
      if (interests.includes('Healthcare') && topCareer.sector === 'healthcare') {
        context += 'they want to help people and work in medical settings. ';
      } else if (interests.includes('Hands-on Work') && topCareer.sector === 'infrastructure') {
        context += 'they enjoy building, fixing, and working with their hands. ';
      } else if (interests.includes('Technology')) {
        context += 'they are fascinated by computers and digital innovation. ';
      } else {
        context += 'it matches their core interests and values. ';
      }
    }
    
    // Add skill-based context
    if (skills.length > 0) {
      context += `They have demonstrated strengths in ${skills.join(', ')}, which will be valuable assets in their chosen field. `;
    }
    
    // Add work environment preferences
    if (profile.workEnvironment) {
      context += `They prefer ${profile.workEnvironment} work environments, `;
      if (profile.workEnvironment === 'outdoor') {
        context += 'showing they value fresh air, physical activity, and nature-based work. ';
      } else if (profile.workEnvironment === 'indoor') {
        context += 'indicating they work well in controlled, focused environments. ';
      } else {
        context += 'showing flexibility and adaptability to different settings. ';
      }
    }
    
    return context;
  }

  /**
   * Get personalized insight based on assessment answer and career match
   */
  private static getPersonalizedInsight(questionId: string, answer: string | number, topCareer?: Career): string {
    if (!topCareer) return `This preference will guide their career exploration`;
    
    const insights: { [key: string]: { [key: string]: string } } = {
      'interests': {
        'Healthcare': `Perfect alignment with ${topCareer.title} - they can directly help patients and make a medical impact`,
        'Hands-on Work': `Excellent match for ${topCareer.title} - they'll use tools and build/fix things daily`,
        'Technology': `Strong fit for ${topCareer.title} - they'll work with cutting-edge digital tools and systems`,
        'Community Impact': `Great connection to ${topCareer.title} - they'll serve their local community directly`
      },
      'work_environment': {
        'Outdoors': `${topCareer.title} offers outdoor work opportunities, perfect for their preference`,
        'Indoors': `${topCareer.title} provides controlled indoor environments they prefer`,
        'Mixed': `${topCareer.title} offers the variety of settings they enjoy`
      }
    };

    const category = insights[questionId];
    if (category && typeof answer === 'string' && category[answer]) {
      return category[answer];
    }
    
    return `This aligns well with ${topCareer.title} career requirements`;
  }

  /**
   * Get specific recommendation based on assessment answer and career
   */
  private static getSpecificRecommendation(questionId: string, answer: string | number, topCareer?: Career): string {
    if (!topCareer) return 'Focus on exploring careers that match this preference';
    
    const recommendations: { [key: string]: { [key: string]: string } } = {
      'interests': {
        'Healthcare': `Take Biology, Chemistry, and Health Sciences courses to prepare for healthcare careers`,
        'Hands-on Work': `Enroll in Shop class, Industrial Arts, or Engineering courses for construction and trades`,
        'Technology': `Take Computer Science, Programming, or Digital Media courses for technology careers`,
        'Community Impact': `Join volunteer organizations and take Social Studies courses for public service roles`
      },
      'work_environment': {
        'Outdoors': `Look for internships or job shadowing in outdoor roles related to your interests`,
        'Indoors': `Seek office-based or lab experiences in your field of interest`,
        'Mixed': `Explore both field and office aspects of careers that interest you`
      }
    };

    const category = recommendations[questionId];
    if (category && typeof answer === 'string' && category[answer]) {
      return category[answer];
    }
    
    return `Pursue experiences and education that prepare you for ${topCareer.title}`;
  }

  /**
   * Get personalized career reasoning
   */
  private static getPersonalizedCareerReasoning(
    match: CareerMatch,
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[]
  ): string {
    const interests = profile.interests || [];
    const skills = profile.skills || [];
    
    let reasoning = '';
    
    // Connect to specific interests
    if (interests.includes('Healthcare') && match.career.sector === 'healthcare') {
      reasoning += 'they love helping people and are interested in medical work';
    } else if (interests.includes('Hands-on Work') && match.career.sector === 'infrastructure') {
      reasoning += 'they enjoy building, fixing, and working with tools';
    } else if (interests.includes('Technology')) {
      reasoning += 'they are passionate about computers and digital innovation';
    } else {
      reasoning += 'it matches their core interests perfectly';
    }
    
    // Add skill connections
    if (skills.length > 0) {
      reasoning += ` and they already have ${skills[0]} skills that are directly applicable`;
    }
    
    return reasoning;
  }

  /**
   * Explain how career fits student's profile
   */
  private static explainCareerFit(career: Career, profile: Partial<StudentProfile>): string {
    const interests = profile.interests || [];
    
    // Comprehensive sector-based explanations
    const sectorExplanations = {
      'healthcare': 'You can directly help patients, work in medical settings, and make a real difference in people\'s health',
      'infrastructure': 'You\'ll build, repair, and create things with your hands while solving practical problems',
      'technology': 'You\'ll work with cutting-edge technology and digital tools to solve complex problems',
      'education': 'You\'ll inspire and teach others, helping shape the next generation\'s future',
      'business': 'You\'ll develop business strategies, manage operations, and drive organizational success',
      'creative': 'You\'ll express creativity, design beautiful things, and bring artistic visions to life',
      'public-service': 'You\'ll serve your community, protect others, and make a positive impact on society',
      'agriculture': 'You\'ll work with nature, grow food, and contribute to sustainable farming practices',
      'transportation': 'You\'ll keep people and goods moving safely and efficiently across communities',
      'hospitality': 'You\'ll create positive experiences for guests and provide excellent customer service',
      'manufacturing': 'You\'ll create products, operate machinery, and contribute to the production process',
      'retail': 'You\'ll help customers find what they need and provide friendly, helpful service',
      'finance': 'You\'ll manage money, analyze financial data, and help people make smart financial decisions',
      'legal': 'You\'ll help people navigate legal issues and ensure justice is served fairly',
      'science': 'You\'ll conduct research, make discoveries, and advance human knowledge through scientific inquiry'
    };
    
    // Check for direct sector match
    const explanation = sectorExplanations[career.sector as keyof typeof sectorExplanations];
    if (explanation) {
      return explanation;
    }
    
    // Check for interest-based matches
    if (interests.includes('Healthcare') && career.sector === 'healthcare') {
      return sectorExplanations['healthcare'];
    } else if (interests.includes('Hands-on Work') && ['infrastructure', 'manufacturing', 'agriculture'].includes(career.sector)) {
      return sectorExplanations[career.sector as keyof typeof sectorExplanations] || sectorExplanations['infrastructure'];
    } else if (interests.includes('Technology') && career.sector === 'technology') {
      return sectorExplanations['technology'];
    } else if (interests.includes('Community Impact') && ['public-service', 'education', 'healthcare'].includes(career.sector)) {
      return sectorExplanations[career.sector as keyof typeof sectorExplanations] || sectorExplanations['public-service'];
    } else if (interests.includes('Creative') && career.sector === 'creative') {
      return sectorExplanations['creative'];
    } else if (interests.includes('Business') && ['business', 'finance'].includes(career.sector)) {
      return sectorExplanations[career.sector as keyof typeof sectorExplanations] || sectorExplanations['business'];
    }
    
    return 'This career aligns with your interests and will provide meaningful work';
  }

  /**
   * Get salary context for student
   */
  private static getSalaryContext(salary: number, zipCode: string): string {
    if (salary > 60000) {
      return `excellent income for ${zipCode} area, well above average`;
    } else if (salary > 40000) {
      return `good middle-class income for ${zipCode} area`;
    } else {
      return `entry-level income with growth potential in ${zipCode} area`;
    }
  }

  /**
   * Get education advice based on grade and requirements
   */
  private static getEducationAdvice(educationLevel: string, grade: number): string {
    const yearsLeft = Math.max(0, 12 - grade);
    
    if (educationLevel === 'certificate') {
      return `Perfect! You can start this program right after high school in ${yearsLeft + 1} years`;
    } else if (educationLevel === 'associate') {
      return `Great choice! 2-year program you can start in ${yearsLeft + 1} years at community college`;
    } else if (educationLevel === 'bachelor') {
      return `Plan for 4-year university starting in ${yearsLeft + 1} years - start preparing now`;
    }
    
    return `Plan your education path starting in ${yearsLeft + 1} years`;
  }

  /**
   * Get local demand advice
   */
  private static getLocalDemandAdvice(demand: string, zipCode: string): string {
    if (demand === 'high') {
      return `excellent job prospects in ${zipCode} area - employers are actively hiring`;
    } else if (demand === 'medium') {
      return `good opportunities in ${zipCode} area with steady job growth`;
    } else {
      return `limited local opportunities - consider nearby areas or remote work`;
    }
  }

  /**
   * Get personalized next steps
   */
  private static getPersonalizedNextSteps(career: Career, profile: Partial<StudentProfile>, grade: number): string {
    const interests = profile.interests || [];
    
    // Provide sector-specific next steps based on the career's sector
    switch (career.sector) {
      case 'healthcare':
        return `1) Take Biology and Chemistry courses, 2) Volunteer at local hospital, 3) Shadow a ${career.title}`;
      
      case 'infrastructure':
      case 'manufacturing':
        return `1) Take Shop/Industrial Arts, 2) Find apprenticeship opportunities, 3) Visit construction sites`;
      
      case 'technology':
        return `1) Take Computer Science courses, 2) Learn programming online, 3) Join tech clubs`;
      
      case 'creative':
        return `1) Take Visual Arts courses, 2) Build a creative portfolio, 3) Enter art competitions`;
      
      case 'education':
        return `1) Take Psychology courses, 2) Start tutoring younger students, 3) Observe different classrooms`;
      
      case 'business':
      case 'finance':
        return `1) Take Economics courses, 2) Join business club, 3) Find part-time retail job`;
      
      case 'public-service':
        return `1) Take Social Studies/Civics, 2) Volunteer in community, 3) Shadow ${career.title}`;
      
      case 'science':
        return `1) Take Advanced Science courses, 2) Participate in science fair, 3) Contact research facilities`;
      
      case 'agriculture':
        return `1) Learn about farming practices, 2) Visit local farms, 3) Gain hands-on farm experience`;
      
      case 'transportation':
        return `1) Learn about vehicle maintenance, 2) Study transportation regulations, 3) Practice safety protocols`;
      
      case 'hospitality':
        return `1) Practice customer service skills, 2) Find part-time hospitality job, 3) Learn about guest relations`;
      
      case 'retail':
        return `1) Develop sales skills, 2) Work in customer service, 3) Learn product knowledge`;
      
      case 'legal':
        return `1) Take debate/speech courses, 2) Learn about legal system, 3) Shadow legal professionals`;
      
      default:
        return `1) Research ${career.title} requirements, 2) Find relevant courses, 3) Connect with professionals in ${career.sector}`;
    }
  }

  /**
   * Calculate job relevance to student profile
   */
  private static calculateJobRelevance(
    job: LocalJobOpportunity,
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[]
  ): number {
    let relevance = 50; // Base relevance
    
    const interests = profile.interests || [];
    const topCareer = careerMatches[0]?.career;
    
    // Check if job title matches career interests
    if (topCareer && job.title.toLowerCase().includes(topCareer.title.toLowerCase())) {
      relevance += 30;
    }
    
    // Check sector alignment
    if (interests.includes('Healthcare') && job.category === 'healthcare') {
      relevance += 20;
    } else if (interests.includes('Hands-on Work') && job.category === 'infrastructure') {
      relevance += 20;
    }
    
    // Distance factor
    if (job.distance < 15) relevance += 10;
    else if (job.distance > 30) relevance -= 10;
    
    return Math.min(95, Math.max(10, relevance));
  }

  /**
   * Explain job relevance to student
   */
  private static explainJobRelevance(job: LocalJobOpportunity, profile: Partial<StudentProfile>): string {
    const interests = profile.interests || [];
    
    if (interests.includes('Healthcare') && job.category === 'healthcare') {
      return 'This matches your healthcare interests and desire to help people';
    } else if (interests.includes('Hands-on Work')) {
      return 'This involves the hands-on, practical work you enjoy';
    } else if (interests.includes('Technology')) {
      return 'This role involves technology and digital tools you\'re interested in';
    }
    
    return 'This opportunity aligns with your career goals and interests';
  }

  /**
   * Get commute advice based on distance
   */
  private static getCommuteAdvice(distance: number): string {
    if (distance < 10) return 'very convenient commute';
    else if (distance < 20) return 'reasonable daily commute';
    else if (distance < 30) return 'manageable commute, consider carpooling';
    else return 'longer commute, but worth it for the right opportunity';
  }

  /**
   * Compare salary to career goals
   */
  private static compareSalaryToGoals(jobSalary: string, careerAvgSalary?: number): string {
    if (!careerAvgSalary) return 'competitive salary for entry-level position';
    
    // Extract numeric value from job salary string
    const salaryMatch = jobSalary.match(/\$?(\d+(?:,\d+)*)/);
    if (!salaryMatch) return 'salary details to be discussed';
    
    const jobSalaryNum = parseInt(salaryMatch[1].replace(/,/g, ''));
    
    if (jobSalaryNum >= careerAvgSalary * 0.9) {
      return 'excellent salary, at or above career average';
    } else if (jobSalaryNum >= careerAvgSalary * 0.7) {
      return 'good starting salary with growth potential';
    } else {
      return 'entry-level salary, expect increases with experience';
    }
  }

  /**
   * Get job application advice for student
   */
  private static getJobApplicationAdvice(
    job: LocalJobOpportunity,
    profile: Partial<StudentProfile>,
    grade: number
  ): string {
    const yearsToGraduation = Math.max(0, 12 - grade);
    
    if (yearsToGraduation > 1) {
      return `Save this for after graduation in ${yearsToGraduation} years, but research the company now`;
    } else if (yearsToGraduation === 1) {
      return 'Perfect timing - apply during senior year or right after graduation';
    } else {
      return 'You can apply now - highlight your relevant coursework and enthusiasm';
    }
  }

  /**
   * Identify best opportunities for student
   */
  private static identifyBestOpportunities(
    jobs: LocalJobOpportunity[],
    profile: Partial<StudentProfile>
  ): string {
    const interests = profile.interests || [];
    const relevantJobs = jobs.filter(job => {
      if (interests.includes('Healthcare')) return job.category === 'healthcare';
      if (interests.includes('Hands-on Work')) return job.category === 'infrastructure';
      if (interests.includes('Technology')) return job.title.toLowerCase().includes('tech');
      return true;
    });
    
    if (relevantJobs.length > 0) {
      return `${relevantJobs[0].title} positions (${relevantJobs.length} available)`;
    }
    
    return 'entry-level positions in your field of interest';
  }

  /**
   * Get application strategy for student
   */
  private static getApplicationStrategy(
    jobs: LocalJobOpportunity[],
    profile: Partial<StudentProfile>,
    grade: number
  ): string {
    const yearsToGraduation = Math.max(0, 12 - grade);
    
    if (yearsToGraduation > 1) {
      return 'Focus on education and skill-building now, start networking with these employers';
    } else if (yearsToGraduation === 1) {
      return 'Start building relationships with these employers, apply for internships or part-time roles';
    } else {
      return 'Apply directly to entry-level positions, emphasize your enthusiasm and willingness to learn';
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
   * Get recommended course focus based on interests and sector
   */
  private static getRecommendedCourseFocus(interests: string[], sector?: string): string {
    if (interests.includes('Healthcare') || sector === 'healthcare') return 'science and health';
    if (interests.includes('Hands-on Work') || sector === 'infrastructure' || sector === 'manufacturing') return 'math and shop';
    if (interests.includes('Technology') || sector === 'technology') return 'computer science and math';
    if (interests.includes('Business') || sector === 'business' || sector === 'finance') return 'business and economics';
    if (interests.includes('Education') || sector === 'education') return 'psychology and communication';
    if (interests.includes('Creative') || sector === 'creative') return 'art and media';
    if (interests.includes('Science') || sector === 'science') return 'advanced science and math';
    if (interests.includes('Public Service') || sector === 'public-service') return 'social studies and civics';
    return 'core academic';
  }

  /**
   * Get experience recommendation based on interests and sector
   */
  private static getExperienceRecommendation(interests: string[], sector?: string, careerTitle?: string): string {
    if (interests.includes('Healthcare') || sector === 'healthcare') return 'hospital volunteering and healthcare shadowing';
    if (interests.includes('Hands-on Work') || sector === 'infrastructure' || sector === 'manufacturing') return 'apprenticeships and hands-on internships';
    if (interests.includes('Technology') || sector === 'technology') return 'coding projects and tech clubs';
    if (interests.includes('Business') || sector === 'business' || sector === 'finance') return 'business internships and entrepreneurship activities';
    if (interests.includes('Education') || sector === 'education') return 'tutoring and classroom volunteering';
    if (interests.includes('Creative') || sector === 'creative') return 'portfolio building and creative competitions';
    if (interests.includes('Science') || sector === 'science') return 'research projects and science competitions';
    if (interests.includes('Public Service') || sector === 'public-service') return 'community service and civic engagement';
    return `relevant volunteering and ${careerTitle || 'career'} exploration`;
  }

  /**
   * Map interests to sectors for comprehensive personalization
   */
  private static mapInterestsToSectors(interests: string[], topCareerSector?: string): { [key: string]: boolean } {
    const mapping = {
      healthcare: interests.includes('Healthcare') || interests.includes('Helping Others') || topCareerSector === 'healthcare',
      infrastructure: interests.includes('Infrastructure') || interests.includes('Hands-on Work') || topCareerSector === 'infrastructure',
      technology: interests.includes('Technology') || topCareerSector === 'technology',
      education: interests.includes('Education') || interests.includes('Teaching') || topCareerSector === 'education',
      business: interests.includes('Business') || interests.includes('Leadership') || topCareerSector === 'business',
      creative: interests.includes('Creative') || interests.includes('Art') || interests.includes('Design') || topCareerSector === 'creative',
      publicService: interests.includes('Public Service') || interests.includes('Community Impact') || topCareerSector === 'public-service',
      agriculture: interests.includes('Agriculture') || interests.includes('Farming') || interests.includes('Outdoor Work') || topCareerSector === 'agriculture',
      transportation: interests.includes('Transportation') || interests.includes('Driving') || topCareerSector === 'transportation',
      hospitality: interests.includes('Hospitality') || interests.includes('Customer Service') || topCareerSector === 'hospitality',
      manufacturing: interests.includes('Manufacturing') || interests.includes('Building') || topCareerSector === 'manufacturing',
      retail: interests.includes('Retail') || interests.includes('Sales') || topCareerSector === 'retail',
      finance: interests.includes('Finance') || interests.includes('Money') || interests.includes('Numbers') || topCareerSector === 'finance',
      legal: interests.includes('Legal') || interests.includes('Law') || topCareerSector === 'legal',
      science: interests.includes('Science') || interests.includes('Research') || topCareerSector === 'science'
    };
    
    return mapping;
  }

  /**
   * Get company name based on sector
   */
  private static getCompanyNameBySector(sector: string, index: number): string {
    const companyNames = {
      'healthcare': `Local Hospital ${index}`,
      'infrastructure': `Construction Co. ${index}`,
      'technology': `Tech Solutions ${index}`,
      'education': `Learning Center ${index}`,
      'business': `Business Services ${index}`,
      'creative': `Creative Studio ${index}`,
      'public-service': `Public Services ${index}`,
      'agriculture': `Farm & Agriculture ${index}`,
      'transportation': `Transport Services ${index}`,
      'hospitality': `Hospitality Group ${index}`,
      'manufacturing': `Manufacturing Co. ${index}`,
      'retail': `Retail Store ${index}`,
      'finance': `Financial Services ${index}`,
      'legal': `Law Firm ${index}`,
      'science': `Research Lab ${index}`
    };
    
    return companyNames[sector as keyof typeof companyNames] || `Local Company ${index}`;
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