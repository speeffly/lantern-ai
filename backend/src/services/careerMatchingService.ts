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
  careerPathway: {
    steps: string[];
    timeline: string;
    requirements: string[];
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
          const [aiInsights, careerPathway] = await Promise.all([
            this.getCareerInsights(profile, answers, match),
            this.getCareerSpecificPathway(profile, answers, match)
          ]);
          
          enhancedMatches.push({
            ...match,
            aiInsights,
            careerPathway
          });
        } catch (error) {
          console.error(`❌ Failed to get AI insights for ${match.career.title}:`, error);
          // Fallback to basic insights
          enhancedMatches.push({
            ...match,
            aiInsights: this.getBasicInsights(match),
            careerPathway: this.getBasicCareerPathway(match)
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
        aiInsights: this.getBasicInsights(match),
        careerPathway: this.getBasicCareerPathway(match)
      }));
    }
  }

  /**
   * Get career-specific pathway for a specific career match
   */
  private static async getCareerSpecificPathway(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    match: CareerMatch
  ): Promise<EnhancedCareerMatch['careerPathway']> {
    const prompt = `You are a career counselor creating a specific career pathway for a student interested in a particular career.

STUDENT PROFILE:
- Interests: ${profile.interests?.join(', ') || 'Various'}
- Skills: ${profile.skills?.join(', ') || 'Developing'}
- Work Environment: ${profile.workEnvironment || 'Flexible'}
- Education Goal: ${profile.educationGoal || 'Exploring options'}

SPECIFIC CAREER:
- Title: ${match.career.title}
- Sector: ${match.career.sector}
- Required Education: ${match.career.requiredEducation}
- Average Salary: ${match.career.averageSalary.toLocaleString()}
- Certifications: ${match.career.certifications?.join(', ') || 'None specified'}

ASSESSMENT RESPONSES:
${answers.map(answer => `- ${answer.questionId}: ${answer.answer}`).join('\n')}

Create a specific career pathway for becoming a ${match.career.title}. Be very specific to this career - don't use generic steps.

IMPORTANT: Return ONLY valid JSON. No additional text or explanations outside the JSON object.

{
  "steps": [
    "Complete high school with focus on [specific subjects for ${match.career.title}]",
    "Pursue ${match.career.requiredEducation} in [specific program for ${match.career.title}]",
    "Obtain [specific certifications for ${match.career.title}]",
    "Gain experience through [specific opportunities for ${match.career.title}]",
    "Apply for entry-level ${match.career.title} positions",
    "Advance in ${match.career.title} career through [specific advancement paths]"
  ],
  "timeline": "[specific timeline for ${match.career.title} based on education requirements]",
  "requirements": ["${match.career.requiredEducation}", "[specific certifications]", "[specific skills for ${match.career.title}]"]
}

Make each step specific to ${match.career.title} - avoid generic language. Reference the actual career title and sector throughout.`;

    try {
      // Use the same AI service as the main recommendations
      const aiResponse = await AIRecommendationService.callAI(prompt);
      
      // Parse the response
      const cleanedJson = this.cleanCareerPathwayJSON(aiResponse);
      const parsed = JSON.parse(cleanedJson);
      
      return {
        steps: parsed.steps || this.getBasicCareerPathway(match).steps,
        timeline: parsed.timeline || this.getBasicCareerPathway(match).timeline,
        requirements: parsed.requirements || this.getBasicCareerPathway(match).requirements
      };
      
    } catch (error) {
      console.error(`❌ Failed to generate AI career pathway for ${match.career.title}:`, error);
      return this.getBasicCareerPathway(match);
    }
  }

  /**
   * Clean career pathway JSON response
   */
  private static cleanCareerPathwayJSON(response: string): string {
    try {
      // Remove any text before the first {
      let cleaned = response.replace(/^[^{]*/, '').replace(/}[^}]*$/, '}').trim();
      
      // Basic JSON cleaning
      cleaned = cleaned
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/g, '')
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'); // Add quotes to property names
      
      return cleaned;
    } catch (error) {
      throw new Error(`Failed to clean career pathway JSON: ${error}`);
    }
  }

  /**
   * Get basic career pathway as fallback
   */
  private static getBasicCareerPathway(match: CareerMatch): EnhancedCareerMatch['careerPathway'] {
    const career = match.career;
    
    return {
      steps: [
        `Complete high school with focus on subjects relevant to ${career.title}`,
        `Pursue ${career.requiredEducation} program for ${career.title}`,
        `Obtain required certifications for ${career.title}: ${career.certifications?.join(', ') || 'Professional certifications'}`,
        `Gain hands-on experience in ${career.title} through internships or entry-level positions`,
        `Apply for ${career.title} positions in ${career.sector} sector`,
        `Build expertise and advance in ${career.title} career`
      ],
      timeline: career.requiredEducation.includes('Bachelor') ? '4-6 years' : 
                career.requiredEducation.includes('Associate') ? '2-4 years' : '1-3 years',
      requirements: [
        'High school diploma',
        career.requiredEducation,
        ...(career.certifications || ['Professional development'])
      ]
    };
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

IMPORTANT: Return ONLY valid JSON. No additional text or explanations outside the JSON object.

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