import { StudentProfile, AssessmentAnswer, CareerMatch } from '../types';
import { CleanAIRecommendationService } from './cleanAIRecommendationService';

export interface ParentSummary {
  overview: {
    studentStrengths: string[];
    careerDirection: string;
    confidenceLevel: 'High' | 'Medium' | 'Developing';
    readinessForNextSteps: string;
  };
  topCareerPaths: {
    title: string;
    whyGoodFit: string;
    educationRequired: string;
    timeToCareer: string;
    salaryRange: string;
    parentSupport: string[];
  }[];
  supportRecommendations: {
    immediateActions: string[];
    conversationStarters: string[];
    resourcesNeeded: string[];
    timelineExpectations: string;
  };
  academicFocus: {
    priorityCourses: string[];
    extracurriculars: string[];
    summerOpportunities: string[];
    collegePrep: string[];
  };
  financialPlanning: {
    educationCosts: string;
    scholarshipOpportunities: string[];
    savingsRecommendations: string;
    returnOnInvestment: string;
  };
}

export class ParentSummaryService {
  /**
   * Generate comprehensive parent summary
   */
  static async generateParentSummary(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    careerMatches: CareerMatch[],
    currentGrade?: number
  ): Promise<ParentSummary> {
    try {
      // console.log('👨‍👩‍👧‍👦 Generating parent summary...');

      const grade = currentGrade || 11;
      const topCareers = careerMatches.slice(0, 3);

      const prompt = `You are a career counselor preparing a comprehensive summary for parents about their child's career assessment results. Write in a professional, reassuring tone that helps parents understand and support their child's career development.

STUDENT INFORMATION:
- Current Grade: ${grade}
- Interests: ${profile.interests?.join(', ') || 'Exploring various areas'}
- Skills: ${profile.skills?.join(', ') || 'Developing foundational skills'}
- Work Environment Preference: ${profile.workEnvironment || 'Flexible'}
- Education Goals: ${profile.educationGoal || 'Exploring options'}

TOP CAREER MATCHES:
${topCareers.map((match, index) => `
${index + 1}. ${match.career.title} (${match.matchScore}% match)
   - Sector: ${match.career.sector}
   - Education Required: ${match.career.requiredEducation}
   - Average Salary: $${match.career.averageSalary.toLocaleString()}
   - Growth Outlook: ${match.career.growthOutlook}
   - Key Responsibilities: ${match.career.responsibilities?.slice(0, 3).join(', ') || 'Various professional duties'}
`).join('')}

ASSESSMENT INSIGHTS:
${answers.map(answer => `- ${answer.questionId}: ${answer.answer}`).join('\n')}

Create a comprehensive parent summary in JSON format:

IMPORTANT: Return ONLY valid JSON. No additional text or explanations outside the JSON object.

{
  "overview": {
    "studentStrengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
    "careerDirection": "Clear, encouraging summary of career direction",
    "confidenceLevel": "High|Medium|Developing",
    "readinessForNextSteps": "Assessment of student's readiness for career planning"
  },
  "topCareerPaths": [
    {
      "title": "Career title",
      "whyGoodFit": "Why this career suits your child specifically",
      "educationRequired": "Specific education path needed",
      "timeToCareer": "Realistic timeline from now to career entry",
      "salaryRange": "Expected salary range",
      "parentSupport": ["how parents can help 1", "how parents can help 2", "how parents can help 3"]
    }
  ],
  "supportRecommendations": {
    "immediateActions": ["action parents can take now 1", "action 2", "action 3"],
    "conversationStarters": ["conversation topic 1", "topic 2", "topic 3"],
    "resourcesNeeded": ["resource 1", "resource 2", "resource 3"],
    "timelineExpectations": "What to expect over the next 1-2 years"
  },
  "academicFocus": {
    "priorityCourses": ["course 1", "course 2", "course 3"],
    "extracurriculars": ["activity 1", "activity 2", "activity 3"],
    "summerOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "collegePrep": ["prep activity 1", "prep activity 2", "prep activity 3"]
  },
  "financialPlanning": {
    "educationCosts": "Realistic cost expectations for chosen career path",
    "scholarshipOpportunities": ["scholarship type 1", "scholarship type 2", "scholarship type 3"],
    "savingsRecommendations": "Practical savings advice",
    "returnOnInvestment": "Expected career ROI and financial outlook"
  }
}

Focus on being supportive, realistic, and actionable. Help parents understand how to best support their child's career development journey.`;

      const aiResponse = await CleanAIRecommendationService.callAI(prompt);
      
      // Parse AI response
      const cleanResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // console.log('✅ Parent summary generated successfully');
      return parsed;

    } catch (error) {
      // console.error('❌ Parent summary generation failed:', error);
      return this.generateFallbackParentSummary(profile, careerMatches, currentGrade);
    }
  }

  /**
   * Generate fallback parent summary when AI fails
   */
  private static generateFallbackParentSummary(
    profile: Partial<StudentProfile>,
    careerMatches: CareerMatch[],
    currentGrade?: number
  ): ParentSummary {
    const grade = currentGrade || 11;
    const topCareer = careerMatches[0];

    return {
      overview: {
        studentStrengths: profile.skills || ['Communication', 'Problem-solving', 'Adaptability'],
        careerDirection: `Your child shows strong interest in ${profile.interests?.join(' and ') || 'multiple career areas'} and is developing valuable skills for their future career.`,
        confidenceLevel: 'Medium',
        readinessForNextSteps: `As a Grade ${grade} student, your child is at an excellent stage to explore career options and make informed decisions about their future.`
      },
      topCareerPaths: careerMatches.slice(0, 3).map(match => ({
        title: match.career.title,
        whyGoodFit: `This career aligns well with your child's interests and shows a ${match.matchScore}% compatibility based on their assessment.`,
        educationRequired: match.career.requiredEducation,
        timeToCareer: grade >= 11 ? '2-4 years' : '3-5 years',
        salaryRange: `$${Math.round(match.career.averageSalary * 0.8 / 1000)}k - $${Math.round(match.career.averageSalary * 1.2 / 1000)}k annually`,
        parentSupport: [
          'Encourage exploration of this field',
          'Help research education options',
          'Support relevant extracurricular activities'
        ]
      })),
      supportRecommendations: {
        immediateActions: [
          'Discuss career assessment results with your child',
          'Research local colleges and training programs',
          'Connect with professionals in fields of interest'
        ],
        conversationStarters: [
          'What excites you most about these career options?',
          'How can we explore these fields together?',
          'What kind of work environment appeals to you?'
        ],
        resourcesNeeded: [
          'Career exploration resources',
          'College and training program information',
          'Financial planning for education'
        ],
        timelineExpectations: 'Over the next 1-2 years, focus on academic preparation and career exploration. Major decisions about post-secondary education typically happen in junior/senior year.'
      },
      academicFocus: {
        priorityCourses: topCareer?.career.sector === 'healthcare' 
          ? ['Biology', 'Chemistry', 'Health Sciences']
          : ['Mathematics', 'English', 'Science'],
        extracurriculars: [
          'Clubs related to career interests',
          'Volunteer opportunities',
          'Leadership activities'
        ],
        summerOpportunities: [
          'Internships or job shadowing',
          'Summer camps in areas of interest',
          'Community service projects'
        ],
        collegePrep: [
          'Maintain strong GPA',
          'Prepare for standardized tests',
          'Build a well-rounded application profile'
        ]
      },
      financialPlanning: {
        educationCosts: topCareer?.career.requiredEducation.includes('Bachelor') 
          ? 'Plan for 4-year college costs ($40k-$120k total depending on school choice)'
          : 'Consider more affordable options like community college or trade programs ($10k-$40k total)',
        scholarshipOpportunities: [
          'Merit-based scholarships',
          'Career-specific scholarships',
          'Local community scholarships'
        ],
        savingsRecommendations: 'Start or continue regular education savings. Consider 529 plans for tax advantages.',
        returnOnInvestment: `${topCareer?.career.title || 'The chosen career'} offers good earning potential with an average salary of $${topCareer?.career.averageSalary.toLocaleString() || '50,000'} annually.`
      }
    };
  }
}