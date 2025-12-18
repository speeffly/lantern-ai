import OpenAI from 'openai';
import { StudentProfile, AssessmentAnswer, CareerMatch, AIRecommendations, LocalJobOpportunity, CourseRecommendation } from '../types';

// Using CourseRecommendation and LocalJobOpportunity interfaces from types/index.ts

// Using AIRecommendations interface from types/index.ts

export class AIRecommendationService {
  /**
   * Generate comprehensive AI-powered recommendations
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
      console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
      console.log('🔑 API Key length:', process.env.OPENAI_API_KEY?.length || 0);

      // Check if we should use real OpenAI or fallback mode
      const useRealAI = process.env.USE_REAL_AI === 'true';
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
      
      console.log('🔧 AI Mode Configuration:');
      console.log('   - USE_REAL_AI flag:', useRealAI);
      console.log('   - OpenAI API key present:', hasOpenAIKey);
      
      // If real AI is requested but no API key, throw error
      if (useRealAI && !hasOpenAIKey) {
        console.error('❌ Real AI requested but OpenAI API key is missing');
        throw new Error('Real AI mode enabled but OpenAI API key is required. Please configure OPENAI_API_KEY environment variable.');
      }
      
      // If not using real AI, use fallback recommendations
      if (!useRealAI) {
        console.log('🔄 Using fallback AI recommendations (USE_REAL_AI=false)');
        return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
      }

      // Prepare context for AI
      const context = this.prepareAIContext(profile, answers, careerMatches, zipCode, currentGrade);
      
      // Generate recommendations using OpenAI
      const aiResponse = await this.callOpenAI(context);
      
      // Parse and structure the AI response
      const recommendations = this.parseAIResponse(aiResponse, profile, careerMatches, zipCode);
      
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
      return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
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
    currentGrade?: number
  ): string {
    const grade = currentGrade || 11;
    const interests = profile.interests?.join(', ') || 'Exploring career options';
    const skills = profile.skills?.join(', ') || 'Developing foundational skills';
    
    return `
COMPREHENSIVE STUDENT PROFILE ANALYSIS:

Personal Information:
- Current Grade: ${grade}
- Location: ZIP Code ${zipCode} (Rural area)
- Age Range: ${14 + (grade - 9)} years old

Interest & Preference Profile:
- Primary Interests: ${interests}
- Work Environment Preference: ${profile.workEnvironment || 'Mixed indoor/outdoor'}
- Team vs Individual Work: ${profile.teamPreference || 'Both'}
- Education Commitment Level: ${profile.educationGoal || 'Certificate/Associate degree'}

Detailed Assessment Responses:
${answers.map((answer, index) => {
  return `${index + 1}. Question: ${answer.questionId}
   Response: ${answer.answer}
   Context: This indicates ${this.interpretAssessmentAnswer(answer.questionId, answer.answer)}`;
}).join('\n\n')}

Top Career Matches Analysis:
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

Rural Context Considerations:
- Limited local training options may require online/distance learning
- Transportation challenges for education and work opportunities
- Strong community connections and family considerations important
- Opportunities in agriculture, healthcare, and infrastructure sectors
- Potential for entrepreneurship and small business development
- Need for practical, hands-on career preparation paths
- Community college and trade school accessibility
- Local apprenticeship and mentorship opportunities
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
   * Call OpenAI API for comprehensive recommendations
   */
  private static async callOpenAI(context: string): Promise<string> {
    console.log('🔑 Initializing OpenAI client with key length:', process.env.OPENAI_API_KEY?.length || 0);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    const systemPrompt = `You are Dr. Sarah Martinez, a certified career counselor with 15 years of experience specializing in rural career development and youth guidance. You have:

- Master's degree in Career Counseling and Development
- Certification in Career Development Facilitator (CDF)
- Expertise in rural job markets and economic opportunities
- Extensive experience with high school students aged 14-18
- Deep knowledge of healthcare and infrastructure career pathways
- Understanding of local training programs, apprenticeships, and community colleges
- Experience with rural family dynamics and community considerations

Your counseling approach is:
- Practical and immediately actionable
- Encouraging and confidence-building
- Focused on realistic rural opportunities
- Age-appropriate for high school students
- Evidence-based with clear reasoning
- Culturally sensitive to rural communities and values
- Comprehensive yet easy to understand

You always provide specific, detailed recommendations with clear reasoning, actionable next steps, and consideration of rural challenges and opportunities.`;

    const userPrompt = `${context}

Based on this comprehensive student profile, provide detailed career guidance in the following JSON format. Be specific, practical, and actionable:

{
  "academicPlan": {
    "currentYear": [
      {
        "courseName": "Specific course name",
        "reasoning": "Detailed explanation of why this course is essential for their career goals",
        "careerConnection": "How this directly connects to their top career matches",
        "skillsDeveloped": ["specific skill 1", "specific skill 2"],
        "priority": "Essential|Highly Recommended|Recommended",
        "localAvailability": "How to access this course locally or online"
      }
    ],
    "nextYear": [
      {
        "courseName": "Advanced course building on current year",
        "reasoning": "Why this progression is important",
        "careerConnection": "Career pathway connection",
        "skillsDeveloped": ["skill 1", "skill 2"],
        "priority": "Essential|Highly Recommended|Recommended",
        "localAvailability": "Access information"
      }
    ],
    "longTerm": [
      {
        "option": "Post-secondary education or training option",
        "description": "Detailed description of the program",
        "duration": "Time required",
        "cost": "Estimated cost range",
        "location": "Where available (local, regional, online)",
        "careerOutcomes": "What careers this leads to"
      }
    ]
  },
  "careerPathway": {
    "steps": [
      "Immediate step 1 (next 6 months)",
      "Short-term step 2 (6 months - 2 years)",
      "Medium-term step 3 (2-5 years)",
      "Long-term step 4 (5+ years)"
    ],
    "timeline": "Overall timeline from high school to career",
    "requirements": ["Key requirement 1", "Key requirement 2"],
    "ruralConsiderations": "Specific considerations for rural students",
    "financialPlanning": "Cost estimates and funding strategies"
  },
  "skillGaps": [
    {
      "skill": "Specific skill name",
      "importance": "Critical|Important|Beneficial",
      "howToAcquire": "Detailed, specific methods to develop this skill",
      "timeline": "How long it takes to develop",
      "resources": "Specific resources (online courses, local programs, etc.)",
      "practiceOpportunities": "Where to practice this skill"
    }
  ],
  "actionItems": [
    {
      "title": "Specific action title",
      "description": "Detailed description of what to do",
      "priority": "high|medium|low",
      "timeline": "Specific timeframe (this week, this month, etc.)",
      "category": "Academic|Career Exploration|Skill Development|Networking",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "resources": "What resources are needed",
      "successMetrics": "How to measure completion"
    }
  ],
  "localOpportunities": [
    {
      "type": "Volunteer|Internship|Part-time Job|Mentorship",
      "organization": "Likely local organization name",
      "description": "What the opportunity involves",
      "skills": "Skills gained from this opportunity",
      "careerRelevance": "How this connects to career goals",
      "howToApply": "Steps to pursue this opportunity"
    }
  ]
}

Provide comprehensive, detailed recommendations that are specifically tailored to this rural student's profile, interests, and career goals. Make all recommendations practical and achievable in a rural setting.`;

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
      max_tokens: 3000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Parse AI response into structured recommendations
   */
  private static parseAIResponse(
    aiResponse: string,
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string
  ): AIRecommendations {
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
      
      // Add local job opportunities
      const localJobs = this.generateLocalJobOpportunities(careerMatches, zipCode);
      
      console.log('✅ Successfully parsed AI response');
      return {
        academicPlan: parsed.academicPlan || {
          currentYear: [],
          nextYear: [],
          longTerm: []
        },
        localJobs,
        careerPathway: parsed.careerPathway || this.getDefaultCareerPathway(careerMatches),
        skillGaps: parsed.skillGaps || this.getDefaultSkillGaps(careerMatches),
        actionItems: parsed.actionItems || this.getDefaultActionItems(profile)
      };
      
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.log('🔍 Raw response sample:', aiResponse.substring(0, 200));
      
      // Try one more time with a simpler approach - extract just the parts we need
      try {
        const simpleExtraction = this.extractSimpleRecommendations(aiResponse, profile, careerMatches);
        if (simpleExtraction) {
          console.log('✅ Successfully extracted simple recommendations from AI response');
          return {
            localJobs: this.generateLocalJobOpportunities(careerMatches, zipCode),
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
    return this.generateFallbackRecommendations(profile, careerMatches, zipCode);
  }

  /**
   * Extract simple recommendations using regex patterns
   */
  private static extractSimpleRecommendations(
    aiResponse: string,
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[]
  ): Partial<AIRecommendations> | null {
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
   * Generate local job opportunities (simulated - in production would use job APIs)
   */
  private static generateLocalJobOpportunities(
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
  private static generateFallbackRecommendations(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): AIRecommendations {
    const grade = currentGrade || 11;
    const isHealthcareInterested = profile.interests?.includes('Healthcare') || 
                                  careerMatches[0]?.career.sector === 'healthcare';
    
    return {
      academicPlan: {
        currentYear: this.getRelevantCourses(grade, isHealthcareInterested, 'current'),
        nextYear: this.getRelevantCourses(grade + 1, isHealthcareInterested, 'next'),
        longTerm: this.getRelevantCourses(grade + 2, isHealthcareInterested, 'longterm')
      },
      localJobs: this.generateLocalJobOpportunities(careerMatches, zipCode),
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
}