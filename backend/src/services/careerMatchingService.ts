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
  skillGaps: {
    skill: string;
    importance: string;
    howToAcquire: string;
  }[];
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
          const [aiInsights, careerPathway, skillGaps] = await Promise.all([
            this.getCareerInsights(profile, answers, match),
            this.getCareerSpecificPathway(profile, answers, match),
            this.getCareerSpecificSkillGaps(profile, answers, match)
          ]);
          
          enhancedMatches.push({
            ...match,
            aiInsights,
            careerPathway,
            skillGaps
          });
        } catch (error) {
          console.error(`❌ Failed to get AI insights for ${match.career.title}:`, error);
          // Fallback to basic insights
          enhancedMatches.push({
            ...match,
            aiInsights: this.getBasicInsights(match),
            careerPathway: this.getBasicCareerPathway(match),
            skillGaps: this.getBasicSkillGaps(match)
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
        careerPathway: this.getBasicCareerPathway(match),
        skillGaps: this.getBasicSkillGaps(match)
      }));
    }
  }

  /**
   * Get career-specific skill gaps for a specific career match
   */
  private static async getCareerSpecificSkillGaps(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    match: CareerMatch
  ): Promise<EnhancedCareerMatch['skillGaps']> {
    const prompt = `You are a career counselor identifying specific skill gaps for a student interested in a particular career.

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

Identify the top 3-4 skill gaps this student needs to address specifically for ${match.career.title}. Focus on skills that are critical for this specific career, not generic skills.

IMPORTANT: Return ONLY valid JSON. No additional text or explanations outside the JSON object.

{
  "skillGaps": [
    {
      "skill": "Specific skill name for ${match.career.title}",
      "importance": "Critical",
      "howToAcquire": "Specific advice for developing this skill for ${match.career.title} career"
    },
    {
      "skill": "Another specific skill for ${match.career.title}",
      "importance": "Important", 
      "howToAcquire": "Specific advice for this skill in ${match.career.title} context"
    }
  ]
}

Make each skill specific to ${match.career.title} - avoid generic skills like "communication" unless they have career-specific context.`;

    try {
      // Use the same AI service as the main recommendations
      const aiResponse = await AIRecommendationService.callAI(prompt);
      
      // Parse the response
      const cleanedJson = this.cleanCareerPathwayJSON(aiResponse);
      const parsed = JSON.parse(cleanedJson);
      
      return parsed.skillGaps || this.getBasicSkillGaps(match);
      
    } catch (error) {
      console.error(`❌ Failed to generate AI skill gaps for ${match.career.title}:`, error);
      return this.getBasicSkillGaps(match);
    }
  }

  /**
   * Get basic skill gaps as fallback
   */
  private static getBasicSkillGaps(match: CareerMatch): EnhancedCareerMatch['skillGaps'] {
    const career = match.career;
    
    // Generate career-specific skill gaps based on sector
    const skillGaps: EnhancedCareerMatch['skillGaps'] = [];
    
    switch (career.sector) {
      case 'healthcare':
        skillGaps.push(
          {
            skill: 'Medical Terminology',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - take health sciences courses, use medical terminology apps, volunteer at hospitals`
          },
          {
            skill: 'Patient Care Skills',
            importance: 'Critical',
            howToAcquire: `Key for ${career.title} - volunteer with elderly, practice active listening, take psychology courses`
          }
        );
        break;
        
      case 'creative':
        skillGaps.push(
          {
            skill: 'Creative Problem Solving',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - practice art projects, learn design software, develop portfolio of creative work`
          },
          {
            skill: 'Visual Design Skills',
            importance: 'Critical',
            howToAcquire: `Key for ${career.title} - learn Adobe Creative Suite, practice composition and color theory, study design principles`
          }
        );
        break;
        
      case 'technology':
        skillGaps.push(
          {
            skill: 'Programming Skills',
            importance: 'Critical',
            howToAcquire: `Necessary for ${career.title} - learn Python or JavaScript online, take computer science courses, build projects`
          },
          {
            skill: 'Technical Problem Solving',
            importance: 'Important',
            howToAcquire: `Valuable for ${career.title} - practice logic puzzles, take math courses, learn data analysis`
          }
        );
        break;
        
      case 'infrastructure':
      case 'manufacturing':
        skillGaps.push(
          {
            skill: 'Technical/Mechanical Skills',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - take shop class, work on DIY projects, find apprenticeships`
          },
          {
            skill: 'Safety Protocols',
            importance: 'Critical',
            howToAcquire: `Important for ${career.title} - learn OSHA regulations, practice safety procedures, understand workplace hazards`
          }
        );
        break;
        
      case 'hospitality':
        skillGaps.push(
          {
            skill: 'Culinary Skills',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - practice cooking techniques, learn knife skills, take culinary arts courses`
          },
          {
            skill: 'Food Safety & Sanitation',
            importance: 'Critical',
            howToAcquire: `Critical for ${career.title} - get ServSafe certification, learn HACCP principles, understand health department regulations`
          },
          {
            skill: 'Kitchen Management',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - learn inventory management, practice time management, understand cost control`
          }
        );
        break;
        
      case 'business':
      case 'finance':
        skillGaps.push(
          {
            skill: 'Financial Analysis',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn Excel, take accounting courses, practice financial modeling`
          },
          {
            skill: 'Business Communication',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - practice presentations, learn business writing, develop negotiation skills`
          }
        );
        break;
        
      case 'education':
        skillGaps.push(
          {
            skill: 'Teaching Methods',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn lesson planning, practice classroom management, study educational psychology`
          },
          {
            skill: 'Student Assessment',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - learn grading techniques, understand learning objectives, practice feedback delivery`
          }
        );
        break;
        
      case 'public-service':
        skillGaps.push(
          {
            skill: 'Public Safety Protocols',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn emergency procedures, practice conflict resolution, understand legal requirements`
          },
          {
            skill: 'Community Relations',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - practice public speaking, learn cultural sensitivity, develop interpersonal skills`
          }
        );
        break;
        
      case 'science':
        skillGaps.push(
          {
            skill: 'Research Methods',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn scientific method, practice data analysis, understand statistical concepts`
          },
          {
            skill: 'Laboratory Skills',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - practice lab techniques, learn equipment operation, understand safety protocols`
          }
        );
        break;
        
      case 'agriculture':
        skillGaps.push(
          {
            skill: 'Agricultural Knowledge',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn crop management, understand soil science, practice sustainable farming`
          },
          {
            skill: 'Equipment Operation',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - learn machinery operation, practice maintenance, understand safety procedures`
          }
        );
        break;
        
      case 'transportation':
        skillGaps.push(
          {
            skill: 'Transportation Regulations',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn DOT regulations, understand safety requirements, get proper licensing`
          },
          {
            skill: 'Vehicle Operation',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - practice driving skills, learn maintenance basics, understand route planning`
          }
        );
        break;
        
      case 'retail':
        skillGaps.push(
          {
            skill: 'Customer Service',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - practice active listening, learn conflict resolution, develop sales techniques`
          },
          {
            skill: 'Product Knowledge',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - study product features, understand customer needs, learn inventory management`
          }
        );
        break;
        
      case 'legal':
        skillGaps.push(
          {
            skill: 'Legal Research',
            importance: 'Critical',
            howToAcquire: `Essential for ${career.title} - learn case law research, practice legal writing, understand court procedures`
          },
          {
            skill: 'Legal Analysis',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - practice critical thinking, learn legal reasoning, understand precedent analysis`
          }
        );
        break;
        
      default:
        skillGaps.push(
          {
            skill: 'Communication',
            importance: 'Important',
            howToAcquire: `Essential for ${career.title} - join speech/debate club, practice presentations, work on customer service`
          },
          {
            skill: 'Industry Knowledge',
            importance: 'Important',
            howToAcquire: `Important for ${career.title} - research industry trends, follow professional publications, network with professionals`
          }
        );
    }
    
    return skillGaps;
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