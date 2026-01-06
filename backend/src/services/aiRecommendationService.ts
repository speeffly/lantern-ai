import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudentProfile, AssessmentAnswer, CareerMatch, AIRecommendations, LocalJobOpportunity, CourseRecommendation } from '../types';
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
   - Average Salary: ${match.career.averageSalary.toLocaleString()}
   - Key Responsibilities: ${match.career.responsibilities?.slice(0, 3).join(', ') || 'Various duties'}
   - Required Certifications: ${match.career.certifications?.join(', ') || 'None specified'}
   - Growth Outlook: ${match.career.growthOutlook || 'Stable'}
   - Match Reasons: ${match.reasoningFactors?.join(', ') || 'Strong alignment with interests'}
   - Local Demand: ${match.localDemand}`;
}).join('\n\n')}

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

    const systemPrompt = `You are Alex Johnson, a modern career coach specializing in technology and entrepreneurship for Gen Z students.`;

    const userPrompt = `${context}

As Alex Johnson, provide innovative career guidance for this high school student. Focus on emerging opportunities, technology careers, and entrepreneurial pathways.

IMPORTANT: Respond with ONLY valid JSON. Do not include any text before or after the JSON object. Ensure all strings are properly quoted and all objects/arrays are properly closed.

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
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "timeline": "Timeline description",
    "requirements": ["Requirement 1", "Requirement 2"]
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
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "timeline": "Timeline description",
    "requirements": ["Requirement 1", "Requirement 2"]
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
        careerPathway: parsed.careerPathway || this.getDefaultCareerPathway(careerMatches),
        skillGaps: parsed.skillGaps || this.getDefaultSkillGaps(careerMatches),
        actionItems: parsed.actionItems || this.getDefaultActionItems(profile)
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
            careerPathway: this.getDefaultCareerPathway(careerMatches),
            skillGaps: this.getDefaultSkillGaps(careerMatches),
            actionItems: this.getDefaultActionItems(profile)
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
            skillGaps: simpleExtraction.skillGaps || this.getDefaultSkillGaps(careerMatches),
            actionItems: simpleExtraction.actionItems || this.getDefaultActionItems(profile)
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
        skillGaps: this.getDefaultSkillGaps(careerMatches),
        actionItems: this.getDefaultActionItems(profile)
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
      
      // Step 3: Fix common JSON issues that cause "Expected ',' or '}'" errors
      jsonString = jsonString
        // Fix missing quotes around property names
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
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
        });

      // Step 4: Balance braces and brackets
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

      // Step 5: Try to parse and fix specific errors
      try {
        JSON.parse(jsonString);
        console.log('✅ JSON cleanup successful');
        return jsonString;
      } catch (parseError) {
        console.log('🔧 First parse failed, attempting targeted fixes...');
        
        if (parseError instanceof SyntaxError) {
          const errorMessage = parseError.message;
          
          // Fix specific error: Expected ',' or '}' after property value
          if (errorMessage.includes("Expected ',' or '}'")) {
            // Find the position mentioned in the error
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
                // Extra content before closing brace
                jsonString = beforeError + afterError;
              }
            } else {
              // General fix for missing commas
              jsonString = jsonString
                .replace(/([^,}\]]\s*)(\s*"[^"]*"\s*:)/g, '$1,$2')
                .replace(/,\s*,/g, ',');
            }
          }
          
          // Fix specific error: Unexpected token
          if (errorMessage.includes('Unexpected token')) {
            jsonString = jsonString
              .replace(/([^",}\]]\s+)(["{])/g, '$1,$2')
              .replace(/,\s*,/g, ',');
          }
        }
        
        // Try parsing again
        try {
          JSON.parse(jsonString);
          console.log('✅ Targeted JSON fixes successful');
          return jsonString;
        } catch (finalError) {
          console.log('⚠️ JSON cleanup partially successful, may have remaining issues');
          return jsonString; // Return best effort
        }
      }
      
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
        company: `Local ${match.career.sector === 'healthcare' ? 'Hospital' : 'Company'} ${index + 1}`,
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