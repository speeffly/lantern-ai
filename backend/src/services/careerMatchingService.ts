import { StudentProfile, AssessmentAnswer, CareerMatch } from '../types';
import { AIRecommendationService } from './aiRecommendationService';

export interface EnhancedCareerMatch extends CareerMatch {
  aiInsights: {
    whyItMatches: string;
    personalizedDescription: string;
    keyStrengths: string[];
    developmentAreas: string[];
    nextSteps: string[];
  };
}

export class CareerMatchingService {
  /**
   * Get career matches with AI-enhanced insights
   */
  static async getEnhancedMatches(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    baseMatches: CareerMatch[]
  ): Promise<EnhancedCareerMatch[]> {
    try {
      console.log('🎯 Generating AI-enhanced career matches...');
      
      // Get AI insights for top career matches
      const topMatches = baseMatches.slice(0, 5); // Top 5 matches
      const enhancedMatches: EnhancedCareerMatch[] = [];

      for (const match of topMatches) {
        try {
          const aiInsights = await this.getCareerInsights(profile, answers, match);
          enhancedMatches.push({
            ...match,
            aiInsights
          });
        } catch (error) {
          console.error(`❌ Failed to get AI insights for ${match.career.title}:`, error);
          // Fallback to basic insights
          enhancedMatches.push({
            ...match,
            aiInsights: this.getBasicInsights(match)
          });
        }
      }

      console.log(`✅ Generated AI insights for ${enhancedMatches.length} career matches`);
      return enhancedMatches;

    } catch (error) {
      console.error('❌ Career matching enhancement failed:', error);
      // Return basic matches without AI enhancement
      return baseMatches.slice(0, 5).map(match => ({
        ...match,
        aiInsights: this.getBasicInsights(match)
      }));
    }
  }

  /**
   * Get AI insights for a specific career match
   */
  private static async getCareerInsights(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    match: CareerMatch
  ): Promise<EnhancedCareerMatch['aiInsights']> {
    const prompt = `You are a career counselor analyzing why a specific career matches a student's profile.

STUDENT PROFILE:
- Interests: ${profile.interests?.join(', ') || 'Various'}
- Skills: ${profile.skills?.join(', ') || 'Developing'}
- Work Environment: ${profile.workEnvironment || 'Flexible'}
- Education Goal: ${profile.educationGoal || 'Exploring options'}

CAREER MATCH:
- Title: ${match.career.title}
- Sector: ${match.career.sector}
- Match Score: ${match.matchScore}%
- Required Education: ${match.career.requiredEducation}
- Average Salary: $${match.career.averageSalary.toLocaleString()}
- Growth Outlook: ${match.career.growthOutlook}

ASSESSMENT RESPONSES:
${answers.map(answer => `- ${answer.questionId}: ${answer.answer}`).join('\n')}

Provide a personalized analysis in JSON format:

{
  "whyItMatches": "2-3 sentences explaining why this career aligns with the student's interests, skills, and goals",
  "personalizedDescription": "Rewrite the career description in a way that connects to this specific student's interests and strengths",
  "keyStrengths": ["strength 1 that applies to this career", "strength 2", "strength 3"],
  "developmentAreas": ["skill 1 to develop", "skill 2 to develop", "skill 3 to develop"],
  "nextSteps": ["immediate action 1", "immediate action 2", "immediate action 3"]
}

Focus on being specific and actionable for this individual student.`;

    const aiResponse = await AIRecommendationService.callAI(prompt);
    
    try {
      // Clean and parse AI response
      const cleanResponse = aiResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      return {
        whyItMatches: parsed.whyItMatches || `This career aligns well with your interests in ${profile.interests?.join(' and ')}.`,
        personalizedDescription: parsed.personalizedDescription || match.career.description || 'A rewarding career opportunity.',
        keyStrengths: parsed.keyStrengths || ['Communication skills', 'Problem-solving', 'Adaptability'],
        developmentAreas: parsed.developmentAreas || ['Technical skills', 'Industry knowledge', 'Professional experience'],
        nextSteps: parsed.nextSteps || ['Research the field', 'Talk to professionals', 'Explore education options']
      };
    } catch (parseError) {
      console.error('Failed to parse career insights:', parseError);
      return this.getBasicInsights(match);
    }
  }

  /**
   * Fallback basic insights when AI fails
   */
  private static getBasicInsights(match: CareerMatch): EnhancedCareerMatch['aiInsights'] {
    return {
      whyItMatches: `This career scored ${match.matchScore}% based on your assessment responses and shows strong alignment with your interests.`,
      personalizedDescription: match.career.description || `${match.career.title} professionals work in ${match.career.sector} and typically earn around $${match.career.averageSalary.toLocaleString()} annually.`,
      keyStrengths: ['Communication skills', 'Problem-solving abilities', 'Adaptability'],
      developmentAreas: ['Industry-specific knowledge', 'Technical skills', 'Professional experience'],
      nextSteps: [
        `Research ${match.career.title} job requirements`,
        'Connect with professionals in the field',
        `Explore ${match.career.requiredEducation} programs`
      ]
    };
  }
}