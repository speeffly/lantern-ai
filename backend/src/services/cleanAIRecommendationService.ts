import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudentProfile, AssessmentAnswer, CareerMatch, AIRecommendations, LocalJobOpportunity } from '../types';

export class CleanAIRecommendationService {
  /**
   * Generate AI recommendations with clean, focused approach
   */
  static async generateRecommendations(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): Promise<AIRecommendations> {
    try {
      // Check if we should use real AI
      const useRealAI = process.env.USE_REAL_AI === 'true';
      console.log('\n🚀 UserAI :'+useRealAI);
      if (!useRealAI) {
        return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
      }

      // LOG ONLY ASSESSMENT ANSWERS AND PROMPT
       console.log('\n📝 -------- Clean Recommendation Service ASSESSMENT ANSWERS:');
       console.log('='.repeat(50));
       answers.forEach((answer, index) => {
         console.log(`${index + 1}. ${answer.questionId}: ${JSON.stringify(answer.answer)}`);
       });
       console.log('='.repeat(50));

      // Create focused context for AI
      const context = this.createFocusedContext(profile, answers, careerMatches, zipCode, currentGrade);
      
       console.log('\n🚀 AI PROMPT:');
      console.log('='.repeat(50));
       console.log(context);
       console.log('='.repeat(50));

      // Call AI service
      const aiResponse = await this.callAI(context);
      
      // Parse and return recommendations
      return this.parseAIResponse(aiResponse, careerMatches);

    } catch (error) {
      // console.error('❌ AI service error:', error instanceof Error ? error.message : 'Unknown error');
      return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
    }
  }

  /**
   * Generate comprehensive career guidance package
   */
  static async generateComprehensiveGuidance(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): Promise<any> {
    try {
      // For now, just return the basic recommendations
      // This can be expanded later to include enhanced career matches, parent summary, etc.
      return await this.generateRecommendations(profile, answers, careerMatches, zipCode, currentGrade);
    } catch (error) {
      // console.error('❌ Comprehensive guidance generation failed:', error);
      return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
    }
  }

  /**
   * Create focused context for AI using RTCROS framework
   */
  private static createFocusedContext(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): string {
    const topCareer = careerMatches[0]?.career;
    const hasDirectSelection = careerMatches[0]?.matchScore >= 90;
    
    // Extract key information from assessment answers
    const assessmentData = this.extractAssessmentData(answers);
    
    return `RTCROS CAREER COUNSELING ANALYSIS

ROLE:
You are a Senior Career Counselor AI specializing in high school career guidance. Your expertise includes career pathway planning, education requirements analysis, and personalized recommendation generation based on student assessment data.

TASK:
Analyze the provided student assessment responses and generate personalized career recommendations with specific pathways. ${hasDirectSelection ? 
`CRITICAL: This student has made a DIRECT CAREER SELECTION of "${topCareer?.title}". You MUST prioritize this career as the #1 recommendation and focus on providing a clear pathway to achieve this specific goal.` : 
'Provide 5-6 diverse career recommendations based on the student\'s interests, skills, and constraints.'}

CONTEXT:
Student Profile:
- Grade Level: ${currentGrade || 'Not specified'}
- Geographic Location: ZIP ${zipCode}
- Education Commitment: ${profile.educationGoal || 'Not specified'}
- Primary Interests: ${profile.interests?.join(', ') || 'Not specified'}
- Key Skills: ${profile.skills?.join(', ') || 'Not specified'}

Assessment Response Analysis:
${assessmentData}

Available Career Matches (Ranked by Compatibility):
${careerMatches.map((match, index) => 
  `${index + 1}. ${match.career.title} (${match.matchScore}% match)
     - Sector: ${match.career.sector}
     - Education Required: ${match.career.requiredEducation}
     - Average Salary: ${match.career.averageSalary?.toLocaleString() || 'Not specified'}
     - Growth Outlook: ${match.career.growthOutlook || 'Not specified'}`
).join('\n')}

${hasDirectSelection ? 
`DIRECT SELECTION CONTEXT:
The student has specifically chosen "${topCareer?.title}" with a ${careerMatches[0]?.matchScore}% match score. This indicates a clear career preference that must be respected and supported with a detailed achievement pathway.` : 
'EXPLORATION CONTEXT:\nThe student is exploring career options and needs guidance to discover suitable paths based on their assessment responses.'}

REASONING:
Apply the following 6-point analysis framework:
1. COMPATIBILITY ASSESSMENT: Evaluate how well each career aligns with the student's interests, skills, and academic performance
2. EDUCATION PATHWAY ANALYSIS: Consider the student's education willingness against career requirements
3. CONSTRAINT EVALUATION: Factor in any stated limitations (financial, time, geographic, physical)
4. GROWTH POTENTIAL: Assess long-term career prospects and advancement opportunities
5. SKILL GAP IDENTIFICATION: Determine what additional skills or education the student needs
6. PERSONALIZATION FACTOR: Ensure recommendations reflect the student's unique profile and stated preferences

${hasDirectSelection ? 
`DIRECT SELECTION REASONING:
- PRIORITY: ${topCareer?.title} must be the #1 recommendation (student's explicit choice)
- PATHWAY FOCUS: Career pathway should be specifically tailored to achieving ${topCareer?.title}
- ALTERNATIVES: Any additional careers should be related specializations in the same field
- VALIDATION: Confirm the student's choice aligns with their skills and education commitment` :
`EXPLORATION REASONING:
- DIVERSITY: Provide careers from 2-3 related sectors to give meaningful options
- ALIGNMENT: Ensure all recommendations match the student's assessment responses
- PROGRESSION: Order recommendations by compatibility score and student fit
- BALANCE: Include both immediate and long-term career possibilities`}

OUTPUT:
Generate a comprehensive career guidance response in the following JSON structure. Ensure all recommendations are specific, actionable, and directly tied to the student's assessment data:

{
  "careerRecommendations": [
    {
      "title": "${hasDirectSelection ? topCareer?.title : 'Most Compatible Career'}",
      "matchPercentage": ${hasDirectSelection ? careerMatches[0]?.matchScore : 'Calculated based on assessment'},
      "explanation": "Detailed explanation referencing specific assessment responses and why this career fits the student",
      "salaryRange": "Realistic salary range based on location and experience level",
      "educationRequired": "Specific education path (e.g., 'Bachelor's in Aerospace Engineering')",
      "keySkills": ["skill1", "skill2", "skill3"]
    }
    // Include 4-5 additional recommendations
  ],
  "careerPathway": {
    "steps": [
      "${hasDirectSelection ? `Complete high school with focus on math, science, and physics for ${topCareer?.title}` : 'Complete high school with focus on relevant subjects'}",
      "${hasDirectSelection ? `Pursue ${topCareer?.requiredEducation} in ${topCareer?.title.includes('Engineer') ? 'engineering' : 'relevant field'}` : 'Pursue appropriate post-secondary education'}",
      "Gain practical experience through internships or entry-level positions",
      "Obtain required certifications or licenses",
      "Apply for professional positions and continue career development"
    ],
    "timeline": "${hasDirectSelection ? this.getTimelineForEducation(topCareer?.requiredEducation) : '4-6 years depending on chosen path'}",
    "requirements": ["High school diploma", "Relevant post-secondary education", "Industry certifications"]
  },
  "skillGaps": [
    {
      "skill": "${hasDirectSelection ? `Specific skill needed for ${topCareer?.title}` : 'Relevant skill for chosen career'}",
      "importance": "Critical",
      "howToAcquire": "Specific advice for developing this skill"
    }
  ]
}

STOPPING:
Validate your response meets these 6 quality criteria before finalizing:
1. ACCURACY: All career information is factually correct and realistic
2. PERSONALIZATION: Recommendations directly reference the student's specific assessment responses
3. SPECIFICITY: Avoid generic advice - provide concrete, actionable steps
4. COMPLETENESS: All required JSON fields are populated with meaningful content
5. CONSISTENCY: Career pathway aligns with the recommended careers and education requirements
6. ${hasDirectSelection ? 'DIRECT SELECTION RESPECT: ' + topCareer?.title + ' is the #1 recommendation with a detailed achievement pathway' : 'EXPLORATION SUPPORT: Diverse, well-reasoned career options that help the student make informed decisions'}

Return ONLY the JSON response - no additional text or explanations.`;
  }

  /**
   * Get timeline based on education requirement
   */
  private static getTimelineForEducation(education?: string): string {
    switch (education) {
      case 'bachelor': return '4-5 years (Bachelor\'s degree)';
      case 'associate': return '2-3 years (Associate degree)';
      case 'certificate': return '6 months - 2 years (Certificate program)';
      case 'high-school': return '0-1 years (High school completion)';
      case 'master': return '6-7 years (Bachelor\'s + Master\'s)';
      case 'doctorate': return '8-12 years (Bachelor\'s + Graduate degrees)';
      default: return '4-6 years depending on education path';
    }
  }

  /**
   * Extract and format assessment data clearly
   */
  private static extractAssessmentData(answers: AssessmentAnswer[]): string {
    const data: string[] = [];
    
    answers.forEach(answer => {
      const questionId = answer.questionId;
      const response = answer.answer;
      
      // Format key responses clearly
      if (questionId === 'q3_career_knowledge') {
        data.push(`Career Knowledge: ${response} (${response === 'yes' ? 'Has specific career in mind' : 'Exploring options'})`);
      } else if (questionId === 'q3a_career_categories') {
        data.push(`Career Category: ${response}`);
      } else if (questionId === 'q3a2_engineering_careers') {
        data.push(`SPECIFIC ENGINEERING CAREER: ${response} (CRITICAL - Student's direct choice)`);
      } else if (questionId === 'q5_education_willingness') {
        data.push(`Education Willingness: ${response}`);
      } else if (questionId === 'q4_academic_performance') {
        data.push(`Academic Performance: ${JSON.stringify(response)}`);
      } else if (questionId === 'q19_20_impact_inspiration') {
        data.push(`Career Inspiration: "${response}"`);
      } else if (typeof response === 'string' && response.length > 10) {
        data.push(`${questionId}: "${response}"`);
      } else {
        data.push(`${questionId}: ${JSON.stringify(response)}`);
      }
    });
    
    return data.join('\n');
  }

  /**
   * Call AI service (OpenAI or Gemini) - Public method for external use
   */
  static async callAI(context: string): Promise<string> {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 CLEAN AI SERVICE - callAI() START');
    console.log('='.repeat(80));
    
    const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    const useRealAI = process.env.USE_REAL_AI === 'true';
    
    console.log('📋 AI Configuration:');
    console.log('   - USE_REAL_AI:', useRealAI);
    console.log('   - AI_PROVIDER:', aiProvider);
    console.log('   - OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('   - OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('   - OPENAI_API_KEY preview:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    console.log('   - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('   - Context length:', context.length, 'characters');
    
    if (!useRealAI) {
      console.log('⚠️  USE_REAL_AI is false - would normally throw error');
      throw new Error('Real AI is disabled (USE_REAL_AI=false)');
    }
    
    if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      console.log('🔵 Using Gemini AI provider');
      return this.callGemini(context);
    } else if (process.env.OPENAI_API_KEY) {
      console.log('🟢 Using OpenAI provider');
      return this.callOpenAI(context);
    } else {
      console.error('❌ No AI provider configured!');
      console.error('   - aiProvider:', aiProvider);
      console.error('   - OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
      console.error('   - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
      throw new Error('No AI provider configured - missing API keys');
    }
  }

  /**
   * Call Gemini API with RTCROS framework
   */
  private static async callGemini(context: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `RTCROS SYSTEM CONFIGURATION

ROLE: You are a Senior Career Counselor AI with expertise in high school career guidance and pathway planning.

TASK: Process student assessment data using the RTCROS framework to generate deterministic, personalized career recommendations.

CONTEXT: You will receive structured student assessment responses with career matches and must provide JSON-formatted recommendations.

REASONING: Apply systematic 6-point analysis (compatibility, education, constraints, growth, skills, personalization) to ensure consistent, logical recommendations.

OUTPUT: Return ONLY valid JSON matching the specified structure - no additional text, explanations, or formatting.

STOPPING: Validate accuracy, personalization, specificity, completeness, consistency, and selection respect before responding.

CRITICAL RULES:
1. If student made direct career selection (90%+ match), make that career #1 recommendation
2. DO NOT override direct selections with unrelated careers
3. Reference specific assessment responses in explanations
4. Provide actionable, concrete steps and timelines
5. Return ONLY valid JSON - no additional text`;

    const result = await model.generateContent(`${systemPrompt}\n\n${context}`);
    const response = result.response;
    return response.text();
  }

  /**
   * Call OpenAI API with RTCROS framework
   */
  private static async callOpenAI(context: string): Promise<string> {
    console.log('\n🟢 CALLING OPENAI API...');
    console.log('   - API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('   - API Key preview:', process.env.OPENAI_API_KEY?.substring(0, 15) + '...');
    
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });

      const systemPrompt = `RTCROS SYSTEM CONFIGURATION

ROLE: You are a Senior Career Counselor AI with expertise in high school career guidance and pathway planning.

TASK: Process student assessment data using the RTCROS framework to generate deterministic, personalized career recommendations.

CONTEXT: You will receive structured student assessment responses with career matches and must provide JSON-formatted recommendations.

REASONING: Apply systematic 6-point analysis (compatibility, education, constraints, growth, skills, personalization) to ensure consistent, logical recommendations.

OUTPUT: Return ONLY valid JSON matching the specified structure - no additional text, explanations, or formatting.

STOPPING: Validate accuracy, personalization, specificity, completeness, consistency, and selection respect before responding.

CRITICAL RULES:
1. If student made direct career selection (90%+ match), make that career #1 recommendation
2. DO NOT override direct selections with unrelated careers
3. Reference specific assessment responses in explanations
4. Provide actionable, concrete steps and timelines
5. Return ONLY valid JSON - no additional text`;

      console.log('   - System prompt length:', systemPrompt.length);
      console.log('   - User context length:', context.length);
      console.log('   - Calling OpenAI chat.completions.create...');

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      console.log('✅ OPENAI RESPONSE RECEIVED');
      console.log('   - Response length:', response.length);
      console.log('   - Response preview:', response.substring(0, 100) + '...');
      console.log('   - Model used:', completion.model);
      console.log('   - Tokens used:', completion.usage?.total_tokens || 'unknown');
      console.log('='.repeat(80));
      console.log('🤖 CLEAN AI SERVICE - callAI() SUCCESS');
      console.log('='.repeat(80) + '\n');

      return response;
      
    } catch (error) {
      console.error('\n' + '='.repeat(80));
      console.error('❌ OPENAI API CALL FAILED');
      console.error('='.repeat(80));
      console.error('   - Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('   - Error message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof Error && 'response' in error) {
        const apiError = error as any;
        console.error('   - API Status:', apiError.response?.status);
        console.error('   - API Error:', apiError.response?.data);
      }
      
      console.error('   - Full error:', error);
      console.error('='.repeat(80) + '\n');
      
      throw error;
    }
  }

  /**
   * Parse AI response and create recommendations
   */
  private static parseAIResponse(aiResponse: string, careerMatches: CareerMatch[]): AIRecommendations {
    try {
      // Clean the response
      const cleanedResponse = this.cleanAIResponse(aiResponse);
      const parsed = JSON.parse(cleanedResponse);
      
      return {
        localJobs: [],
        academicPlan: {
          currentYear: [
            {
              courseCode: 'MATH-101',
              courseName: 'Mathematics',
              description: 'Core mathematics course',
              credits: 4,
              provider: 'High School',
              semester: 'Fall',
              priority: 'high' as const
            },
            {
              courseCode: 'SCI-101',
              courseName: 'Science',
              description: 'Core science course',
              credits: 4,
              provider: 'High School',
              semester: 'Fall',
              priority: 'high' as const
            }
          ],
          nextYear: [
            {
              courseCode: 'MATH-201',
              courseName: 'Advanced Mathematics',
              description: 'Advanced mathematics course',
              credits: 4,
              provider: 'High School',
              semester: 'Fall',
              priority: 'high' as const
            }
          ],
          longTerm: [
            {
              courseCode: 'POST-SEC',
              courseName: 'Post-secondary Education',
              description: 'College or university education',
              credits: 120,
              provider: 'College/University',
              semester: 'Multiple',
              priority: 'high' as const
            }
          ]
        },
        careerPathway: parsed.careerPathway || {
          steps: ['Complete high school', 'Pursue relevant education', 'Gain experience'],
          timeline: '4-6 years',
          requirements: ['High school diploma']
        },
        skillGaps: parsed.skillGaps || [],
        actionItems: parsed.careerRecommendations?.map((rec: any) => ({
          title: `Pursue ${rec.title}`,
          description: rec.explanation || 'Career recommendation based on assessment',
          priority: 'high' as const,
          timeline: rec.timeline || 'Long-term'
        })) || []
      };
    } catch (error) {
      // console.error('❌ Failed to parse AI response:', error instanceof Error ? error.message : 'Unknown error');
      return this.generateFallbackRecommendations({}, careerMatches, '00000');
    }
  }

  /**
   * Clean AI response to ensure valid JSON
   */
  private static cleanAIResponse(response: string): string {
    // Remove any text before the first {
    const startIndex = response.indexOf('{');
    if (startIndex === -1) {
      throw new Error('No JSON found in response');
    }
    
    // Remove any text after the last }
    const endIndex = response.lastIndexOf('}');
    if (endIndex === -1) {
      throw new Error('No complete JSON found in response');
    }
    
    return response.substring(startIndex, endIndex + 1);
  }

  /**
   * Generate fallback recommendations when AI is not available
   */
  private static generateFallbackRecommendations(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): AIRecommendations {
    const topCareer = careerMatches[0]?.career;
    
    return {
      localJobs: [],
      academicPlan: {
        currentYear: [
          {
            courseCode: 'MATH-101',
            courseName: 'Mathematics',
            description: 'Core mathematics course',
            credits: 4,
            provider: 'High School',
            semester: 'Fall',
            priority: 'high' as const
          },
          {
            courseCode: 'SCI-101',
            courseName: 'Science',
            description: 'Core science course',
            credits: 4,
            provider: 'High School',
            semester: 'Fall',
            priority: 'high' as const
          }
        ],
        nextYear: [
          {
            courseCode: 'MATH-201',
            courseName: 'Advanced Mathematics',
            description: 'Advanced mathematics course',
            credits: 4,
            provider: 'High School',
            semester: 'Fall',
            priority: 'high' as const
          }
        ],
        longTerm: [
          {
            courseCode: 'POST-SEC',
            courseName: topCareer?.requiredEducation || 'Post-secondary Education',
            description: 'College or university education',
            credits: 120,
            provider: 'College/University',
            semester: 'Multiple',
            priority: 'high' as const
          }
        ]
      },
      careerPathway: {
        steps: [
          `Complete high school with focus on relevant subjects`,
          `Pursue ${topCareer?.requiredEducation || 'appropriate'} education for ${topCareer?.title || 'your chosen career'}`,
          `Gain experience through internships or entry-level positions`,
          `Apply for ${topCareer?.title || 'career'} positions`,
          `Continue professional development in your field`
        ],
        timeline: '4-6 years depending on education requirements',
        requirements: [topCareer?.requiredEducation || 'High school diploma', 'Relevant skills', 'Work experience']
      },
      skillGaps: [],
      actionItems: careerMatches.slice(0, 5).map(match => ({
        title: `Pursue ${match.career.title}`,
        description: `This career aligns with your interests and skills.`,
        priority: 'high' as const,
        timeline: '4-6 years'
      }))
    };
  }

  /**
   * Generate local job opportunities (simplified)
   */
  static async generateLocalJobOpportunities(
    careerMatches: CareerMatch[]
  ): Promise<LocalJobOpportunity[]> {
    // Return empty array for now - job search functionality can be added later
    return [];
  }
}