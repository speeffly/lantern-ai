import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface CareerRoadmapInput {
  career: {
    title: string;
    sector: string;
    requiredEducation: string;
    averageSalary: number;
    description: string;
  };
  studentData: {
    grade: number;
    zipCode: string;
    courseHistory: { [subject: string]: string };
    academicPerformance: { [subject: string]: string };
    supportLevel: string;
    educationCommitment: string;
  };
}

export interface CareerRoadmapOutput {
  careerTitle: string;
  overview: {
    totalTimeToCareer: string;
    estimatedTotalCost: number;
    educationLevel: string;
    difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    jobAvailability: 'High' | 'Medium' | 'Low';
  };
  detailedPath: {
    highSchoolPhase: {
      timeframe: string;
      recommendedCourses: string[];
      extracurriculars: string[];
      skillsToFocus: string[];
      milestones: string[];
      internshipsAndSummerProgram: string[];
    };
    postSecondaryPhase: {
      timeframe: string;
      educationType: string;
      specificPrograms: string[];
      estimatedCost: number;
      keyRequirements: string[];
      internshipOpportunities: string[];
    };
    earlyCareerPhase: {
      timeframe: string;
      entryLevelPositions: string[];
      certifications: string[];
      skillDevelopment: string[];
      networkingTips: string[];
    };
    advancementPhase: {
      timeframe: string;
      careerProgression: string[];
      advancedCertifications: string[];
      leadershipOpportunities: string[];
      salaryProgression: string[];
    };
  };
  localContext: {
    nearbySchools: string[];
    localEmployers: string[];
    regionalOpportunities: string[];
    costOfLivingImpact: string;
  };
}

export class CareerRoadmapService {
  /**
   * Generate a personalized career roadmap using RTCROS methodology
   */
  static async generateCareerRoadmap(input: CareerRoadmapInput): Promise<CareerRoadmapOutput> {
    try {
      console.log(`🗺️ Generating career roadmap for: ${input.career.title}`);
      console.log(`👤 Student: Grade ${input.studentData.grade}, ZIP ${input.studentData.zipCode}`);

      const prompt = this.createRTCROSRoadmapPrompt(input);
      
      console.log('🤖 Calling AI for career roadmap generation...');
      const aiResponse = await this.callAI(prompt);
      
      if (!aiResponse) {
        throw new Error('AI service returned empty response');
      }

      console.log('✅ AI response received, parsing roadmap...');
      const roadmap = this.parseRoadmapResponse(aiResponse, input);
      
      console.log(`✅ Career roadmap generated successfully for ${input.career.title}`);
      return roadmap;

    } catch (error) {
      console.error('❌ Career roadmap generation failed:', error);
      return this.generateFallbackRoadmap(input);
    }
  }

  /**
   * Create RTCROS-based prompt for career roadmap generation
   */
  private static createRTCROSRoadmapPrompt(input: CareerRoadmapInput): string {
    const { career, studentData } = input;
    
    // Format course history for prompt
    const courseHistoryText = Object.entries(studentData.courseHistory || {})
      .filter(([_, courses]) => courses && courses.trim())
      .map(([subject, courses]) => `  ${subject}: ${courses}`)
      .join('\n');

    // Format academic performance
    const academicPerformanceText = Object.entries(studentData.academicPerformance || {})
      .map(([subject, rating]) => `  ${subject}: ${rating}`)
      .join('\n');

    return `RTCROS PERSONALIZED CAREER ROADMAP GENERATOR

ROLE:
You are a Senior Career Counselor specializing in creating detailed, personalized career roadmaps for high school students. Your expertise includes education pathway planning, skill development sequencing, and regional career market analysis.

TASK:
Create a comprehensive, step-by-step career roadmap for a Grade ${studentData.grade} student pursuing a career as a ${career.title}. The roadmap must be personalized based on their current academic preparation, course history, and local context.

CONTEXT:
Target Career: ${career.title}
- Sector: ${career.sector}
- Required Education: ${career.requiredEducation}
- Average Salary: $${career.averageSalary?.toLocaleString() || 'Not specified'}
- Description: ${career.description}

Student Profile:
- Current Grade: ${studentData.grade}
- Location: ZIP Code ${studentData.zipCode}
- Education Commitment: ${studentData.educationCommitment}
- Support Level: ${studentData.supportLevel}

Academic Preparation Analysis:
Course History (Advanced/Specialized Courses Taken):
${courseHistoryText || '  No advanced or specialized courses reported'}

Academic Performance Self-Assessment:
${academicPerformanceText}

REASONING:
Apply comprehensive pathway analysis using these 7 critical factors:

1. ACADEMIC READINESS ASSESSMENT:
   - Evaluate current course preparation against career requirements
   - Identify academic strengths and gaps based on course history and self-ratings
   - Determine if student is ahead, on-track, or needs acceleration

2. EDUCATION PATHWAY OPTIMIZATION:
   - Map most efficient route from current grade to career entry
   - Consider student's education commitment level and support system
   - Account for prerequisite sequencing and timing
   - Suggest AP courses and possible elective courses (ex. robotics, thermodynamics, organic chemistry, etc.)

3. SKILL DEVELOPMENT SEQUENCING:
   - Identify core competencies needed for ${career.title}
   - Create logical skill-building progression from high school through career entry
   - Prioritize skills based on student's current strengths and interests
   - Make sure the suggested internship opportunities are in the same area as the student
   - Provide links to applications for internships or programs
   - Include summer programs as well
  
4. PROGRAM SPECIFICITY
   - Have specific acccesible programs and prefer local over others
   - Include links for applications into any programs, colleges, or internshps provided
   - Ensure programs are real through searching internet

5. REGIONAL OPPORTUNITY ANALYSIS:
   - Research education options near ZIP ${studentData.zipCode}
   - Identify local employers and internship opportunities
   - Consider regional salary variations and cost of living

6. TIMELINE PERSONALIZATION:
   - Adjust standard timelines based on student's current preparation level
   - Account for support system and education commitment
   - Provide realistic milestones and checkpoints
   - Divide the plan into sections (ex. high school, college, entry to career)

7. COST-BENEFIT OPTIMIZATION:
   - Estimate total education costs and potential ROI
   - Suggest cost-effective education pathways
   - Consider financial aid and scholarship opportunities

8. RISK MITIGATION PLANNING:
   - Identify potential obstacles and alternative pathways
   - Provide backup options and transferable skills
   - Include market trend considerations

OUTPUT:
Generate a detailed JSON roadmap with specific, actionable steps. Ensure all recommendations are:
- Personalized to this specific student's preparation level
- Geographically relevant to ZIP ${studentData.zipCode}
- Aligned with their education commitment and support level
- Realistic given their current grade and timeline

{
  "careerTitle": "${career.title}",
  "overview": {
    "totalTimeToCareer": "X years from high school graduation",
    "estimatedTotalCost": 50000,
    "educationLevel": "${career.requiredEducation}",
    "difficultyLevel": "Intermediate",
    "jobAvailability": "High"
  },
  "detailedPath": {
    "highSchoolPhase": {
      "timeframe": "Grade ${studentData.grade} - 12",
      "recommendedCourses": ["Specific courses needed for this career and additional courses that would help"],
      "extracurriculars": ["Relevant clubs, activities, competitions"],
      "skillsToFocus": ["Key skills to develop during high school"],
      "milestones": ["Specific achievements to aim for each year"],
      "interships and summer program": ["Internship programs or summer opportunities. Include links for applying"]
    },
    "postSecondaryPhase": {
      "timeframe": "X (based on career) years after high school",
      "educationType": "Bachelor's degree in example field(s)/Associate degree in example field(s)/Certificate/etc.",
      "specificPrograms": ["Colleges/schools/programs to consider"],
      "estimatedCost": $#####,
      "keyRequirements": ["Key Prerequisites from High school"],
      "internshipOpportunities": ["Specific internship programs or companies. Include links for applying"]
    },
    "earlyCareerPhase": {
      "timeframe": "Years 1-3 in career",
      "entryLevelPositions": ["Specific job titles to target"],
      "certifications": ["Professional certifications to pursue"],
      "skillDevelopment": ["Skills to focus on early in career"],
      "networkingTips": ["Industry-specific networking strategies"]
    },
    "advancementPhase": {
      "timeframe": "Years 4-10 in career",
      "careerProgression": ["Typical advancement path and timeline"],
      "advancedCertifications": ["Senior-level certifications"],
      "leadershipOpportunities": ["Management and leadership roles"],
      "salaryProgression": ["Expected salary growth over time"]
    }
  },
  "localContext": {
    "nearbySchools": ["Specific colleges/universities near ZIP ${studentData.zipCode}"],
    "localEmployers": ["Companies in the area that hire for this career"],
    "regionalOpportunities": ["Local industry trends and opportunities"],
    "costOfLivingImpact": "How local cost of living affects career viability"
  }
}

STOPPING:
Ensure your roadmap meets these quality criteria:
1. SPECIFICITY: All recommendations include specific names, programs, links, and actionable steps
2. PERSONALIZATION: Every section reflects this student's unique situation and preparation
3. REALISM: Timeline and costs are accurate and achievable
4. COMPLETENESS: All phases from current grade through career advancement are covered
5. LOCALITY: Regional context is specific to ZIP ${studentData.zipCode} area
6. ACTIONABILITY: Student can immediately act on the recommendations provided

Return ONLY the JSON response - no additional text or explanations.`;
  }

  /**
   * Analyze academic strength from performance ratings
   */
  private static analyzeAcademicStrength(academicPerformance: { [subject: string]: string }): string {
    if (!academicPerformance || Object.keys(academicPerformance).length === 0) {
      return 'Standard academic performance';
    }

    const ratings = Object.values(academicPerformance);
    const excellentCount = ratings.filter(r => r === 'excellent').length;
    const goodCount = ratings.filter(r => r === 'good').length;
    const totalCount = ratings.length;

    if (excellentCount >= totalCount * 0.6) {
      return 'Strong academic performance across multiple subjects';
    } else if (excellentCount + goodCount >= totalCount * 0.7) {
      return 'Good academic performance with some areas of excellence';
    } else {
      return 'Mixed academic performance with room for improvement';
    }
  }

  /**
   * Parse AI response into structured roadmap
   */
  private static parseRoadmapResponse(aiResponse: string, input: CareerRoadmapInput): CareerRoadmapOutput {
    try {
      // Clean the response to extract JSON
      let cleanResponse = aiResponse.trim();
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }

      const parsed = JSON.parse(cleanResponse);
      
      // Validate and ensure all required fields exist
      return {
        careerTitle: parsed.careerTitle || input.career.title,
        overview: {
          totalTimeToCareer: parsed.overview?.totalTimeToCareer || '4-6 years',
          estimatedTotalCost: parsed.overview?.estimatedTotalCost || 50000,
          educationLevel: parsed.overview?.educationLevel || input.career.requiredEducation,
          difficultyLevel: parsed.overview?.difficultyLevel || 'Intermediate',
          jobAvailability: parsed.overview?.jobAvailability || 'Medium'
        },
        detailedPath: {
          highSchoolPhase: {
            timeframe: parsed.detailedPath?.highSchoolPhase?.timeframe || `Grade ${input.studentData.grade} - 12`,
            recommendedCourses: this.ensureArray(parsed.detailedPath?.highSchoolPhase?.recommendedCourses, ['Additional electives']),
            extracurriculars: this.ensureArray(parsed.detailedPath?.highSchoolPhase?.extracurriculars, ['Relevant activities']),
            skillsToFocus: this.ensureArray(parsed.detailedPath?.highSchoolPhase?.skillsToFocus, ['Communication', 'Problem-solving']),
            milestones: this.ensureArray(parsed.detailedPath?.highSchoolPhase?.milestones, ['Maintain good grades']),
            internshipsAndSummerProgram: this.ensureArray(parsed.detailedPath?.highSchoolPhase?.['interships and summer program'], ['Summer programs and internships'])
          },
          postSecondaryPhase: {
            timeframe: parsed.detailedPath?.postSecondaryPhase?.timeframe || '2-4 years',
            educationType: parsed.detailedPath?.postSecondaryPhase?.educationType || input.career.requiredEducation,
            specificPrograms: this.ensureArray(parsed.detailedPath?.postSecondaryPhase?.specificPrograms, ['Relevant degree programs']),
            estimatedCost: parsed.detailedPath?.postSecondaryPhase?.estimatedCost || 40000,
            keyRequirements: this.ensureArray(parsed.detailedPath?.postSecondaryPhase?.keyRequirements, ['High school diploma']),
            internshipOpportunities: this.ensureArray(parsed.detailedPath?.postSecondaryPhase?.internshipOpportunities, ['Industry internships'])
          },
          earlyCareerPhase: {
            timeframe: parsed.detailedPath?.earlyCareerPhase?.timeframe || 'Years 1-3',
            entryLevelPositions: this.ensureArray(parsed.detailedPath?.earlyCareerPhase?.entryLevelPositions, ['Entry-level positions']),
            certifications: this.ensureArray(parsed.detailedPath?.earlyCareerPhase?.certifications, ['Professional certifications']),
            skillDevelopment: this.ensureArray(parsed.detailedPath?.earlyCareerPhase?.skillDevelopment, ['On-the-job skills']),
            networkingTips: this.ensureArray(parsed.detailedPath?.earlyCareerPhase?.networkingTips, ['Professional networking'])
          },
          advancementPhase: {
            timeframe: parsed.detailedPath?.advancementPhase?.timeframe || 'Years 4-10',
            careerProgression: this.ensureArray(parsed.detailedPath?.advancementPhase?.careerProgression, ['Career advancement']),
            advancedCertifications: this.ensureArray(parsed.detailedPath?.advancementPhase?.advancedCertifications, ['Advanced certifications']),
            leadershipOpportunities: this.ensureArray(parsed.detailedPath?.advancementPhase?.leadershipOpportunities, ['Leadership roles']),
            salaryProgression: this.ensureArray(parsed.detailedPath?.advancementPhase?.salaryProgression, ['Salary growth'])
          }
        },
        localContext: {
          nearbySchools: this.ensureArray(parsed.localContext?.nearbySchools, ['Local educational institutions']),
          localEmployers: this.ensureArray(parsed.localContext?.localEmployers, ['Local employers']),
          regionalOpportunities: this.ensureArray(parsed.localContext?.regionalOpportunities, ['Regional opportunities']),
          costOfLivingImpact: parsed.localContext?.costOfLivingImpact || 'Consider local cost of living'
        }
      };

    } catch (parseError) {
      console.error('❌ Failed to parse roadmap AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Generate fallback roadmap when AI fails
   */
  private static generateFallbackRoadmap(input: CareerRoadmapInput): CareerRoadmapOutput {
    const { career, studentData } = input;
    
    return {
      careerTitle: career.title,
      overview: {
        totalTimeToCareer: '4-6 years',
        estimatedTotalCost: 50000,
        educationLevel: career.requiredEducation,
        difficultyLevel: 'Intermediate',
        jobAvailability: 'Medium'
      },
      detailedPath: {
        highSchoolPhase: {
          timeframe: `Grade ${studentData.grade} - 12`,
          recommendedCourses: ['English', 'Mathematics', 'Science', 'Social Studies', 'Electives related to career field'],
          extracurriculars: ['Clubs and activities in area of interest'],
          skillsToFocus: ['Communication', 'Problem-solving', 'Critical thinking'],
          milestones: ['Maintain good grades', 'Explore career through activities'],
          internshipsAndSummerProgram: ['Summer programs related to career field', 'Local internship opportunities']
        },
        postSecondaryPhase: {
          timeframe: '2-4 years after high school',
          educationType: career.requiredEducation,
          specificPrograms: [`Programs related to ${career.title}`],
          estimatedCost: 40000,
          keyRequirements: ['High school diploma', 'Good academic standing'],
          internshipOpportunities: ['Industry-related internships']
        },
        earlyCareerPhase: {
          timeframe: 'Years 1-3 in career',
          entryLevelPositions: [`Entry-level ${career.title} positions`],
          certifications: ['Relevant professional certifications'],
          skillDevelopment: ['Industry-specific skills', 'Professional communication'],
          networkingTips: ['Join professional associations', 'Attend industry events']
        },
        advancementPhase: {
          timeframe: 'Years 4-10 in career',
          careerProgression: ['Senior positions', 'Specialized roles', 'Management opportunities'],
          advancedCertifications: ['Advanced professional certifications'],
          leadershipOpportunities: ['Team leadership', 'Project management'],
          salaryProgression: ['Steady salary increases with experience']
        }
      },
      localContext: {
        nearbySchools: ['Local colleges and universities'],
        localEmployers: ['Regional employers in the field'],
        regionalOpportunities: ['Local job market opportunities'],
        costOfLivingImpact: 'Consider local cost of living when planning'
      }
    };
  }

  /**
   * Ensure value is an array with fallback
   */
  private static ensureArray(value: any, fallback: string[]): string[] {
    if (Array.isArray(value)) {
      return value.filter(item => typeof item === 'string' && item.trim());
    }
    return fallback;
  }

  /**
   * Call AI service (Gemini or OpenAI)
   */
  private static async callAI(prompt: string): Promise<string> {
    const aiProvider = process.env.AI_PROVIDER || 'gemini';
    
    if (aiProvider === 'gemini') {
      return this.callGemini(prompt);
    } else {
      return this.callOpenAI(prompt);
    }
  }

  /**
   * Call Gemini AI
   */
  private static async callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  /**
   * Call OpenAI
   */
  private static async callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a career counselor AI that generates detailed career roadmaps in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    return completion.choices[0]?.message?.content || '';
  }
}