import { StudentProfile, AssessmentAnswer, CareerMatch } from '../types';
import { AIRecommendationService } from './aiRecommendationService';
import { RealJobProvider } from './realJobProvider';

export interface FourYearPlan {
  overview: {
    planSummary: string;
    careerGoal: string;
    educationPath: string;
    keyMilestones: string[];
  };
  yearByYear: {
    year: number;
    grade: string;
    focus: string;
    courses: {
      required: string[];
      recommended: string[];
      advanced: string[];
    };
    extracurriculars: string[];
    careerExploration: string[];
    milestones: string[];
    summerPlanning: string[];
  }[];
  postGraduation: {
    immediateOptions: {
      option: string;
      description: string;
      timeline: string;
      requirements: string[];
      costs: string;
    }[];
    careerTimeline: {
      year: string;
      milestone: string;
      expectedSalary?: string;
    }[];
  };
  marketInsights: {
    industryTrends: string[];
    skillsInDemand: string[];
    salaryProjections: string;
    jobGrowthOutlook: string;
  };
  contingencyPlanning: {
    alternativePaths: string[];
    transferOptions: string[];
    skillPortability: string[];
  };
}

export class AcademicPlanService {
  /**
   * Generate comprehensive 4-year academic plan
   */
  static async generateFourYearPlan(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    zipCode: string,
    currentGrade?: number
  ): Promise<FourYearPlan> {
    try {
      console.log('📚 Generating 4-year academic plan...');

      const grade = currentGrade || 9;
      const topCareers = careerMatches.slice(0, 3);

      // Get market insights for career planning
      const marketInsights = await this.getMarketInsights(topCareers, zipCode);

      const prompt = `You are an academic advisor creating a comprehensive 4-year high school plan for a student based on their career interests and market trends.

STUDENT PROFILE:
- Current Grade: ${grade}
- Interests: ${profile.interests?.join(', ') || 'Exploring various areas'}
- Skills: ${profile.skills?.join(', ') || 'Developing foundational skills'}
- Work Environment: ${profile.workEnvironment || 'Flexible'}
- Education Goals: ${profile.educationGoal || 'Exploring options'}
- Location: ZIP ${zipCode}

TOP CAREER MATCHES:
${topCareers.map((match, index) => `
${index + 1}. ${match.career.title} (${match.matchScore}% match)
   - Sector: ${match.career.sector}
   - Education Required: ${match.career.requiredEducation}
   - Average Salary: $${match.career.averageSalary.toLocaleString()}
   - Growth Outlook: ${match.career.growthOutlook}
   - Key Skills: ${match.career.responsibilities?.slice(0, 3).join(', ') || 'Various professional skills'}
`).join('')}

MARKET INSIGHTS:
${marketInsights.trends.length > 0 ? `
Industry Trends: ${marketInsights.trends.join(', ')}
Skills in Demand: ${marketInsights.skills.join(', ')}
Job Growth: ${marketInsights.growth}
Salary Outlook: ${marketInsights.salary}
` : 'Market data being analyzed...'}

Create a detailed 4-year academic plan in JSON format:

{
  "overview": {
    "planSummary": "Comprehensive summary of the 4-year plan strategy",
    "careerGoal": "Primary career goal based on top matches",
    "educationPath": "Recommended post-secondary education path",
    "keyMilestones": ["milestone 1", "milestone 2", "milestone 3", "milestone 4"]
  },
  "yearByYear": [
    {
      "year": 1,
      "grade": "Grade level",
      "focus": "Main focus for this year",
      "courses": {
        "required": ["required course 1", "required course 2"],
        "recommended": ["recommended course 1", "recommended course 2"],
        "advanced": ["advanced course 1", "advanced course 2"]
      },
      "extracurriculars": ["activity 1", "activity 2", "activity 3"],
      "careerExploration": ["exploration activity 1", "exploration activity 2"],
      "milestones": ["milestone 1", "milestone 2"],
      "summerPlanning": ["summer activity 1", "summer activity 2"]
    }
  ],
  "postGraduation": {
    "immediateOptions": [
      {
        "option": "Option name",
        "description": "Detailed description",
        "timeline": "Duration",
        "requirements": ["requirement 1", "requirement 2"],
        "costs": "Cost estimate"
      }
    ],
    "careerTimeline": [
      {
        "year": "Year description",
        "milestone": "Career milestone",
        "expectedSalary": "Salary range"
      }
    ]
  },
  "marketInsights": {
    "industryTrends": ["trend 1", "trend 2", "trend 3"],
    "skillsInDemand": ["skill 1", "skill 2", "skill 3"],
    "salaryProjections": "Salary growth expectations",
    "jobGrowthOutlook": "Job market growth outlook"
  },
  "contingencyPlanning": {
    "alternativePaths": ["alternative 1", "alternative 2"],
    "transferOptions": ["transfer option 1", "transfer option 2"],
    "skillPortability": ["portable skill 1", "portable skill 2"]
  }
}

Plan should start from Grade ${grade} and go through Grade 12, then include post-graduation planning. Be specific about course sequences, prerequisites, and timing. Consider both traditional and alternative education paths.`;

      const aiResponse = await AIRecommendationService.callAI(prompt);
      
      // Parse AI response
      const cleanResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Ensure we have the right number of years based on current grade
      const yearsRemaining = Math.max(1, 13 - grade); // Grades 9-12
      if (parsed.yearByYear && parsed.yearByYear.length !== yearsRemaining) {
        parsed.yearByYear = this.adjustYearByYearPlan(parsed.yearByYear, grade, yearsRemaining);
      }
      
      console.log('✅ 4-year academic plan generated successfully');
      return parsed;

    } catch (error) {
      console.error('❌ 4-year plan generation failed:', error);
      return this.generateFallbackFourYearPlan(profile, careerMatches, currentGrade);
    }
  }

  /**
   * Get market insights for career planning
   */
  private static async getMarketInsights(
    careerMatches: CareerMatch[],
    zipCode: string
  ): Promise<{
    trends: string[];
    skills: string[];
    growth: string;
    salary: string;
  }> {
    try {
      // Get job market data from RealJobProvider if available
      const topCareer = careerMatches[0];
      if (RealJobProvider.isEnabled()) {
        const jobs = await RealJobProvider.searchJobs({
          careerTitle: topCareer.career.title,
          zipCode: zipCode,
          radiusMiles: 50,
          limit: 10
        });
        
        if (jobs.length > 0) {
          // Extract salary information from real jobs
          const salaries = jobs
            .map(job => job.salary)
            .filter(Boolean)
            .join(', ');
          
          return {
            trends: [
              `${topCareer.career.sector} sector showing ${topCareer.career.growthOutlook} growth`,
              'Digital skills increasingly important across all industries',
              'Remote work opportunities expanding'
            ],
            skills: [
              'Communication and collaboration',
              'Digital literacy',
              'Problem-solving and critical thinking'
            ],
            growth: topCareer.career.growthOutlook || 'Stable growth expected',
            salary: salaries || `Expected salary range: $${Math.round(topCareer.career.averageSalary * 0.8).toLocaleString()} - $${Math.round(topCareer.career.averageSalary * 1.2).toLocaleString()}`
          };
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch market insights:', error);
    }

    // Fallback market insights
    const topCareer = careerMatches[0];
    return {
      trends: [
        `${topCareer.career.sector} sector opportunities`,
        'Technology integration across industries',
        'Emphasis on continuous learning'
      ],
      skills: [
        'Communication skills',
        'Technical proficiency',
        'Adaptability'
      ],
      growth: topCareer.career.growthOutlook || 'Positive outlook',
      salary: `Expected range: $${Math.round(topCareer.career.averageSalary * 0.8).toLocaleString()} - $${Math.round(topCareer.career.averageSalary * 1.2).toLocaleString()}`
    };
  }

  /**
   * Adjust year-by-year plan based on current grade
   */
  private static adjustYearByYearPlan(
    yearByYear: any[],
    currentGrade: number,
    yearsRemaining: number
  ): any[] {
    const adjustedPlan = [];
    
    for (let i = 0; i < yearsRemaining; i++) {
      const grade = currentGrade + i;
      const gradeLabel = `Grade ${grade}`;
      
      adjustedPlan.push({
        year: i + 1,
        grade: gradeLabel,
        focus: this.getGradeFocus(grade),
        courses: this.getGradeCourses(grade),
        extracurriculars: this.getGradeExtracurriculars(grade),
        careerExploration: this.getCareerExploration(grade),
        milestones: this.getGradeMilestones(grade),
        summerPlanning: this.getSummerPlanning(grade)
      });
    }
    
    return adjustedPlan;
  }

  /**
   * Helper methods for fallback planning
   */
  private static getGradeFocus(grade: number): string {
    const focuses = {
      9: 'Foundation building and exploration',
      10: 'Skill development and interest refinement',
      11: 'Advanced preparation and college planning',
      12: 'Application completion and transition preparation'
    };
    return focuses[grade as keyof typeof focuses] || 'Academic and career preparation';
  }

  private static getGradeCourses(grade: number) {
    const courses = {
      9: {
        required: ['English 9', 'Algebra I', 'Biology', 'World History'],
        recommended: ['Foreign Language', 'Art/Music', 'Physical Education'],
        advanced: ['Honors courses if available']
      },
      10: {
        required: ['English 10', 'Geometry', 'Chemistry', 'US History'],
        recommended: ['Foreign Language Level 2', 'Career Exploration'],
        advanced: ['AP courses', 'Dual enrollment options']
      },
      11: {
        required: ['English 11', 'Algebra II', 'Physics', 'Government'],
        recommended: ['Statistics', 'Career-focused electives'],
        advanced: ['AP courses', 'College-level courses']
      },
      12: {
        required: ['English 12', 'Advanced Math', 'Science elective'],
        recommended: ['Career internship', 'College prep courses'],
        advanced: ['AP courses', 'Capstone projects']
      }
    };
    return courses[grade as keyof typeof courses] || courses[12];
  }

  private static getGradeExtracurriculars(grade: number): string[] {
    return [
      'Clubs related to career interests',
      'Community service projects',
      'Leadership opportunities'
    ];
  }

  private static getCareerExploration(grade: number): string[] {
    const exploration = {
      9: ['Career interest surveys', 'Job shadowing opportunities'],
      10: ['Industry research projects', 'Professional interviews'],
      11: ['Internships', 'College visits', 'Career fairs'],
      12: ['Senior capstone projects', 'Transition planning']
    };
    return exploration[grade as keyof typeof exploration] || exploration[12];
  }

  private static getGradeMilestones(grade: number): string[] {
    const milestones = {
      9: ['Complete career assessment', 'Establish strong study habits'],
      10: ['Identify top career interests', 'Begin college research'],
      11: ['Take standardized tests', 'Apply for internships'],
      12: ['Complete college applications', 'Secure post-graduation plans']
    };
    return milestones[grade as keyof typeof milestones] || milestones[12];
  }

  private static getSummerPlanning(grade: number): string[] {
    return [
      'Summer programs in areas of interest',
      'Part-time work or volunteering',
      'Skill development activities'
    ];
  }

  private static zipCodeToLocation(zipCode: string): string {
    // Simplified ZIP to location conversion
    const zipPatterns: { [key: string]: string } = {
      '10': 'New York, NY',
      '11': 'New York, NY',
      '90': 'Los Angeles, CA',
      '94': 'San Francisco, CA',
      '60': 'Chicago, IL',
      '77': 'Houston, TX'
    };
    const prefix = zipCode.substring(0, 2);
    return zipPatterns[prefix] || `ZIP ${zipCode}`;
  }

  /**
   * Generate fallback 4-year plan when AI fails
   */
  private static generateFallbackFourYearPlan(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    currentGrade?: number
  ): FourYearPlan {
    const grade = currentGrade || 9;
    const topCareer = careerMatches[0];
    const yearsRemaining = Math.max(1, 13 - grade);

    return {
      overview: {
        planSummary: `A comprehensive 4-year plan focused on preparing for ${topCareer.career.title} and related careers in ${topCareer.career.sector}.`,
        careerGoal: topCareer.career.title,
        educationPath: topCareer.career.requiredEducation,
        keyMilestones: [
          'Complete strong academic foundation',
          'Gain relevant experience',
          'Prepare for post-secondary education',
          'Transition to career path'
        ]
      },
      yearByYear: this.adjustYearByYearPlan([], grade, yearsRemaining),
      postGraduation: {
        immediateOptions: [
          {
            option: topCareer.career.requiredEducation,
            description: `Pursue ${topCareer.career.requiredEducation} to prepare for ${topCareer.career.title}`,
            timeline: topCareer.career.requiredEducation.includes('Bachelor') ? '4 years' : '2 years',
            requirements: ['High school diploma', 'Good academic standing'],
            costs: topCareer.career.requiredEducation.includes('Bachelor') ? '$40,000-$120,000' : '$10,000-$40,000'
          }
        ],
        careerTimeline: [
          {
            year: 'Years 1-2 post-graduation',
            milestone: 'Complete education/training',
            expectedSalary: 'Entry-level preparation'
          },
          {
            year: 'Years 3-5',
            milestone: 'Begin career, gain experience',
            expectedSalary: `$${Math.round(topCareer.career.averageSalary * 0.7).toLocaleString()}`
          },
          {
            year: 'Years 5+',
            milestone: 'Career advancement',
            expectedSalary: `$${topCareer.career.averageSalary.toLocaleString()}+`
          }
        ]
      },
      marketInsights: {
        industryTrends: [`${topCareer.career.sector} growth opportunities`, 'Technology integration', 'Skills-based hiring'],
        skillsInDemand: ['Communication', 'Problem-solving', 'Technical skills'],
        salaryProjections: `Expected growth in line with ${topCareer.career.growthOutlook}`,
        jobGrowthOutlook: topCareer.career.growthOutlook || 'Positive outlook'
      },
      contingencyPlanning: {
        alternativePaths: ['Related careers in same sector', 'Transfer between similar programs'],
        transferOptions: ['Community college to 4-year university', 'Career change programs'],
        skillPortability: ['Communication skills', 'Problem-solving', 'Work ethic']
      }
    };
  }
}