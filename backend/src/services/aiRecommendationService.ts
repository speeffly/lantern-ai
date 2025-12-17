import OpenAI from 'openai';
import { StudentProfile, AssessmentAnswer, CareerMatch } from '../types';

export interface CourseRecommendation {
  subject: string;
  courseName: string;
  year: number;
  semester: 'Fall' | 'Spring' | 'Both';
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
  prerequisites?: string[];
  careerRelevance: string[];
}

export interface LocalJobOpportunity {
  title: string;
  company: string;
  location: string;
  distance: number; // miles from student
  salaryRange: { min: number; max: number };
  requirements: string[];
  description: string;
  matchScore: number;
}

export interface AIRecommendations {
  academicPlan: {
    currentYear: CourseRecommendation[];
    nextYear: CourseRecommendation[];
    longTerm: CourseRecommendation[];
  };
  localJobs: LocalJobOpportunity[];
  careerPathway: {
    shortTerm: string[]; // 1-2 years
    mediumTerm: string[]; // 3-5 years
    longTerm: string[]; // 5+ years
  };
  skillGaps: {
    skill: string;
    importance: 'Critical' | 'Important' | 'Beneficial';
    howToAcquire: string;
  }[];
  actionItems: {
    priority: 'High' | 'Medium' | 'Low';
    action: string;
    timeline: string;
    category: 'Academic' | 'Skills' | 'Experience' | 'Networking';
  }[];
}

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

      // If OpenAI API key is not available, return fallback recommendations
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not found, using fallback recommendations');
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
      // Fallback to rule-based recommendations
      return this.generateFallbackRecommendations(profile, careerMatches, zipCode, currentGrade);
    }
  }

  /**
   * Prepare context for AI prompt
   */
  private static prepareAIContext(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): string {
    const topCareers = careerMatches.slice(0, 3).map(m => m.career.title).join(', ');
    const interests = profile.interests?.join(', ') || 'General exploration';
    const skills = profile.skills?.join(', ') || 'Developing foundational skills';
    const grade = currentGrade || 11;
    
    return `
Student Profile:
- Current Grade: ${grade}
- Location: ZIP ${zipCode}
- Interests: ${interests}
- Skills: ${skills}
- Education Goal: ${profile.educationGoal || 'certificate'}
- Work Environment Preference: ${profile.workEnvironment || 'mixed'}

Top Career Matches:
${careerMatches.slice(0, 3).map(m => 
  `- ${m.career.title} (${m.matchScore}% match): ${m.career.description}`
).join('\n')}

Assessment Responses Summary:
${answers.slice(0, 5).map(a => `Q: ${a.questionId} - A: ${a.answer}`).join('\n')}

Please provide specific, actionable recommendations for this rural student.
    `;
  }

  /**
   * Call OpenAI API for recommendations
   */
  private static async callOpenAI(context: string): Promise<string> {
    // Initialize OpenAI client with current environment variable
    console.log('🔑 Initializing OpenAI client with key length:', process.env.OPENAI_API_KEY?.length || 0);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    const prompt = `You are a career counselor for rural students. Based on this profile, provide recommendations in valid JSON format only.

${context}

Return only this JSON structure with no extra text or formatting:

{
"careerPathway": {
"shortTerm": ["Complete high school", "Volunteer in field"],
"mediumTerm": ["Get training", "Earn certifications"],
"longTerm": ["Start career", "Advance position"]
},
"skillGaps": [
{
"skill": "Communication",
"importance": "Critical",
"howToAcquire": "Practice speaking"
}
],
"actionItems": [
{
"priority": "High",
"action": "Meet school counselor",
"timeline": "This week",
"category": "Academic"
}
]
}

Keep all text simple and avoid special characters.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor for rural students. Provide specific, actionable guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
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
            ...simpleExtraction
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
        this.getDefaultCareerPathway(careerMatches).shortTerm;
      
      const mediumTerm = mediumTermMatch ? 
        mediumTermMatch[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(s => s) :
        this.getDefaultCareerPathway(careerMatches).mediumTerm;
      
      const longTerm = longTermMatch ? 
        longTermMatch[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(s => s) :
        this.getDefaultCareerPathway(careerMatches).longTerm;
      
      return {
        academicPlan: {
          currentYear: [],
          nextYear: [],
          longTerm: []
        },
        careerPathway: {
          shortTerm,
          mediumTerm,
          longTerm
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
        salaryRange: {
          min: Math.round(match.career.averageSalary * 0.8),
          max: Math.round(match.career.averageSalary * 1.2)
        },
        requirements: match.career.certifications || ['High school diploma'],
        description: `Entry-level ${match.career.title} position with growth opportunities`,
        matchScore: match.matchScore
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
            subject: 'Science',
            courseName: 'Biology',
            year: grade,
            semester: 'Both',
            priority: 'High',
            reasoning: 'Essential foundation for healthcare careers',
            careerRelevance: ['Registered Nurse', 'Medical Assistant']
          },
          {
            subject: 'Science',
            courseName: 'Chemistry',
            year: grade,
            semester: 'Both',
            priority: 'High',
            reasoning: 'Required for nursing and medical programs',
            careerRelevance: ['Registered Nurse', 'LPN']
          },
          {
            subject: 'Mathematics',
            courseName: 'Algebra II',
            year: grade,
            semester: 'Both',
            priority: 'Medium',
            reasoning: 'Needed for dosage calculations and statistics',
            careerRelevance: ['Healthcare careers']
          }
        );
      } else {
        // Infrastructure/trades focus
        courses.push(
          {
            subject: 'Mathematics',
            courseName: 'Geometry',
            year: grade,
            semester: 'Both',
            priority: 'High',
            reasoning: 'Essential for construction and electrical work',
            careerRelevance: ['Electrician', 'Plumber', 'Construction']
          },
          {
            subject: 'Technology',
            courseName: 'Shop/Industrial Arts',
            year: grade,
            semester: 'Both',
            priority: 'High',
            reasoning: 'Hands-on experience with tools and materials',
            careerRelevance: ['All trades careers']
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
        shortTerm: ['Complete high school', 'Explore career options'],
        mediumTerm: ['Pursue relevant training or education'],
        longTerm: ['Enter chosen career field']
      };
    }

    return {
      shortTerm: [
        'Complete high school with strong grades',
        `Research ${topCareer.title} requirements`,
        'Gain relevant experience through volunteering'
      ],
      mediumTerm: [
        `Complete ${topCareer.requiredEducation} program`,
        `Obtain required certifications: ${topCareer.certifications?.join(', ')}`,
        'Apply for entry-level positions'
      ],
      longTerm: [
        `Work as ${topCareer.title}`,
        'Gain experience and additional certifications',
        'Consider advancement or specialization opportunities'
      ]
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
        priority: 'High' as const,
        action: 'Meet with school counselor to discuss career goals',
        timeline: 'This week',
        category: 'Academic' as const
      },
      {
        priority: 'High' as const,
        action: 'Research local training programs and colleges',
        timeline: 'This month',
        category: 'Academic' as const
      },
      {
        priority: 'Medium' as const,
        action: 'Look for volunteer opportunities in your field of interest',
        timeline: 'Next month',
        category: 'Experience' as const
      },
      {
        priority: 'Medium' as const,
        action: 'Connect with professionals in your chosen field',
        timeline: 'Next 3 months',
        category: 'Networking' as const
      }
    ];
  }
}