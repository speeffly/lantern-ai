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
            aiInsights: this.getBasicInsights(match, profile, answers),
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
        aiInsights: this.getBasicInsights(match, profile, answers),
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
   * Get AI insights for a specific career match with enhanced explainability
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
- Average Salary: ${match.career.averageSalary.toLocaleString()}
- Growth Outlook: ${match.career.growthOutlook}

ASSESSMENT RESPONSES:
${answers.map(answer => `- ${answer.questionId}: ${answer.answer}`).join('\n')}

Provide a personalized analysis that explains SPECIFICALLY why this career matches this student. Reference their actual interests, skills, and assessment responses. Be concrete and specific, not generic.

IMPORTANT: Return ONLY valid JSON. No additional text or explanations outside the JSON object.

{
  "whyItMatches": "Explain SPECIFICALLY why ${match.career.title} matches this student's interests in [specific interest], their skills in [specific skill], and their preference for [specific preference]. Reference their actual assessment responses and be concrete about the connections.",
  "personalizedDescription": "Rewrite the ${match.career.title} description to connect directly to this student's interests in [specific interests] and their goal of [specific goal]. Make it personal and relevant to them.",
  "keyStrengths": ["specific strength 1 that this student has for ${match.career.title}", "specific strength 2 from their profile", "specific strength 3 based on their responses"],
  "developmentAreas": ["specific skill 1 this student should develop for ${match.career.title}", "specific skill 2 based on their gaps", "specific skill 3 for career success"],
  "nextSteps": ["immediate action 1 specific to this student and ${match.career.title}", "immediate action 2 based on their situation", "immediate action 3 for career preparation"]
}

CRITICAL: Reference the student's actual interests (${profile.interests?.join(', ')}) and assessment responses. Don't use generic language - be specific about why THIS student matches THIS career.`;

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
      return this.getBasicInsights(match, profile, answers);
    }
  }

  /**
   * Enhanced fallback basic insights with sector-specific explainability
   */
  private static getBasicInsights(
    match: CareerMatch, 
    profile: Partial<StudentProfile>, 
    answers: AssessmentAnswer[]
  ): EnhancedCareerMatch['aiInsights'] {
    const career = match.career;
    const interests = profile.interests || [];
    const skills = profile.skills || [];
    
    // Generate sector-specific explanations
    const sectorSpecificExplanation = this.generateSectorSpecificExplanation(career, interests, skills, match.matchScore);
    const sectorSpecificStrengths = this.generateSectorSpecificStrengths(career, interests, skills);
    const sectorSpecificDevelopmentAreas = this.generateSectorSpecificDevelopmentAreas(career, interests, skills);
    const sectorSpecificNextSteps = this.generateSectorSpecificNextSteps(career, profile);
    
    return {
      whyItMatches: sectorSpecificExplanation,
      personalizedDescription: this.generatePersonalizedDescription(career, interests, skills),
      keyStrengths: sectorSpecificStrengths,
      developmentAreas: sectorSpecificDevelopmentAreas,
      nextSteps: sectorSpecificNextSteps
    };
  }

  /**
   * Generate sector-specific explanation for why a career matches
   */
  private static generateSectorSpecificExplanation(
    career: any, 
    interests: string[], 
    skills: string[], 
    matchScore: number
  ): string {
    const sector = career.sector;
    const title = career.title;
    
    // Find relevant interests for this sector
    const relevantInterests = interests.filter(interest => {
      switch (sector) {
        case 'healthcare':
          return ['Healthcare', 'Helping Others', 'Community Impact'].includes(interest);
        case 'technology':
          return ['Technology', 'Problem Solving', 'Innovation'].includes(interest);
        case 'infrastructure':
        case 'manufacturing':
          return ['Hands-on Work', 'Building', 'Problem Solving'].includes(interest);
        case 'creative':
          return ['Creative', 'Art', 'Design', 'Innovation'].includes(interest);
        case 'education':
          return ['Teaching', 'Helping Others', 'Community Impact'].includes(interest);
        case 'business':
        case 'finance':
          return ['Business', 'Leadership', 'Problem Solving'].includes(interest);
        case 'hospitality':
          return ['Customer Service', 'Creative', 'Helping Others'].includes(interest);
        case 'public-service':
          return ['Community Impact', 'Helping Others', 'Public Service'].includes(interest);
        case 'science':
          return ['Research', 'Problem Solving', 'Innovation', 'Science'].includes(interest);
        case 'agriculture':
          return ['Hands-on Work', 'Outdoors', 'Sustainability'].includes(interest);
        case 'transportation':
          return ['Hands-on Work', 'Travel', 'Problem Solving'].includes(interest);
        case 'retail':
          return ['Customer Service', 'Business', 'Communication'].includes(interest);
        case 'legal':
          return ['Problem Solving', 'Research', 'Helping Others'].includes(interest);
        default:
          return true;
      }
    });

    // Find relevant skills for this sector
    const relevantSkills = skills.filter(skill => {
      switch (sector) {
        case 'healthcare':
          return ['Communication', 'Empathy', 'Problem Solving', 'Science'].includes(skill);
        case 'technology':
          return ['Problem Solving', 'Analytical Thinking', 'Math', 'Innovation'].includes(skill);
        case 'infrastructure':
        case 'manufacturing':
          return ['Problem Solving', 'Math', 'Hands-on Skills', 'Safety'].includes(skill);
        case 'creative':
          return ['Creativity', 'Art', 'Design', 'Innovation', 'Communication'].includes(skill);
        case 'education':
          return ['Communication', 'Patience', 'Leadership', 'Subject Knowledge'].includes(skill);
        case 'business':
        case 'finance':
          return ['Leadership', 'Communication', 'Math', 'Problem Solving'].includes(skill);
        case 'hospitality':
          return ['Customer Service', 'Communication', 'Creativity', 'Teamwork'].includes(skill);
        case 'public-service':
          return ['Communication', 'Leadership', 'Problem Solving', 'Community Service'].includes(skill);
        case 'science':
          return ['Research', 'Analytical Thinking', 'Math', 'Science', 'Problem Solving'].includes(skill);
        case 'agriculture':
          return ['Hands-on Skills', 'Problem Solving', 'Science', 'Sustainability'].includes(skill);
        case 'transportation':
          return ['Problem Solving', 'Safety', 'Communication', 'Hands-on Skills'].includes(skill);
        case 'retail':
          return ['Customer Service', 'Communication', 'Sales', 'Teamwork'].includes(skill);
        case 'legal':
          return ['Research', 'Communication', 'Analytical Thinking', 'Problem Solving'].includes(skill);
        default:
          return true;
      }
    });

    // Generate explanation based on matches
    let explanation = `This ${title} career scored ${matchScore}% match because `;
    
    if (relevantInterests.length > 0) {
      explanation += `it aligns perfectly with your interests in ${relevantInterests.join(' and ')}. `;
    }
    
    if (relevantSkills.length > 0) {
      explanation += `Your strengths in ${relevantSkills.join(' and ')} are directly applicable to ${title} work. `;
    }
    
    // Add sector-specific context
    switch (sector) {
      case 'healthcare':
        explanation += `Healthcare careers like ${title} offer the opportunity to make a direct impact on people's lives while using scientific knowledge and interpersonal skills.`;
        break;
      case 'technology':
        explanation += `Technology careers like ${title} combine problem-solving with innovation, offering high growth potential and the chance to shape the future.`;
        break;
      case 'infrastructure':
      case 'manufacturing':
        explanation += `Infrastructure careers like ${title} involve hands-on problem-solving and building essential systems that communities depend on.`;
        break;
      case 'creative':
        explanation += `Creative careers like ${title} allow you to express artistic vision while solving design challenges and communicating ideas visually.`;
        break;
      case 'education':
        explanation += `Education careers like ${title} combine subject expertise with the rewarding experience of helping others learn and grow.`;
        break;
      case 'business':
      case 'finance':
        explanation += `Business careers like ${title} offer leadership opportunities and the chance to drive organizational success through strategic thinking.`;
        break;
      case 'hospitality':
        explanation += `Hospitality careers like ${title} blend creativity with customer service, creating memorable experiences for people.`;
        break;
      case 'public-service':
        explanation += `Public service careers like ${title} provide the opportunity to serve your community and make a positive impact on society.`;
        break;
      case 'science':
        explanation += `Science careers like ${title} involve research and discovery, contributing to our understanding of the world and solving complex problems.`;
        break;
      case 'agriculture':
        explanation += `Agriculture careers like ${title} combine hands-on work with science and sustainability, feeding communities and protecting the environment.`;
        break;
      case 'transportation':
        explanation += `Transportation careers like ${title} keep people and goods moving safely and efficiently, supporting economic activity.`;
        break;
      case 'retail':
        explanation += `Retail careers like ${title} focus on customer relationships and business operations, directly impacting customer satisfaction.`;
        break;
      case 'legal':
        explanation += `Legal careers like ${title} involve research, analysis, and advocacy, helping people navigate complex legal systems.`;
        break;
      default:
        explanation += `This career offers opportunities that align with your profile and interests.`;
    }
    
    return explanation;
  }

  /**
   * Generate sector-specific strengths
   */
  private static generateSectorSpecificStrengths(career: any, interests: string[], skills: string[]): string[] {
    const sector = career.sector;
    const strengths: string[] = [];
    
    // Add interest-based strengths
    if (interests.includes('Healthcare') || interests.includes('Helping Others')) {
      strengths.push('Natural desire to help and care for others');
    }
    if (interests.includes('Technology') || interests.includes('Problem Solving')) {
      strengths.push('Strong analytical and technical problem-solving abilities');
    }
    if (interests.includes('Hands-on Work') || interests.includes('Building')) {
      strengths.push('Preference for practical, hands-on work and building things');
    }
    if (interests.includes('Creative') || interests.includes('Art')) {
      strengths.push('Creative thinking and artistic expression abilities');
    }
    
    // Add skill-based strengths
    if (skills.includes('Communication')) {
      strengths.push('Strong communication and interpersonal skills');
    }
    if (skills.includes('Problem Solving')) {
      strengths.push('Excellent analytical and problem-solving capabilities');
    }
    if (skills.includes('Leadership')) {
      strengths.push('Natural leadership and team management abilities');
    }
    
    // Add sector-specific strengths
    switch (sector) {
      case 'healthcare':
        strengths.push('Empathy and compassion for patient care', 'Attention to detail for medical accuracy');
        break;
      case 'technology':
        strengths.push('Logical thinking for programming', 'Adaptability to new technologies');
        break;
      case 'infrastructure':
      case 'manufacturing':
        strengths.push('Spatial reasoning for construction', 'Safety consciousness for workplace protection');
        break;
      case 'creative':
        strengths.push('Visual design sense', 'Innovation in creative solutions');
        break;
      case 'education':
        strengths.push('Patience for teaching', 'Knowledge sharing enthusiasm');
        break;
      case 'business':
      case 'finance':
        strengths.push('Strategic thinking for business planning', 'Numerical analysis for financial decisions');
        break;
      case 'hospitality':
        strengths.push('Customer service orientation', 'Multitasking in fast-paced environments');
        break;
      case 'public-service':
        strengths.push('Community service commitment', 'Ethical decision-making');
        break;
      case 'science':
        strengths.push('Research methodology understanding', 'Data analysis capabilities');
        break;
      case 'agriculture':
        strengths.push('Environmental awareness', 'Practical problem-solving in outdoor settings');
        break;
      case 'transportation':
        strengths.push('Safety-first mindset', 'Coordination and logistics thinking');
        break;
      case 'retail':
        strengths.push('Customer relationship building', 'Sales and persuasion abilities');
        break;
      case 'legal':
        strengths.push('Research and analysis skills', 'Attention to legal details');
        break;
    }
    
    // Ensure we have at least 3 strengths
    if (strengths.length < 3) {
      strengths.push('Adaptability and willingness to learn', 'Strong work ethic and dedication');
    }
    
    return strengths.slice(0, 4); // Return top 4 strengths
  }

  /**
   * Generate sector-specific development areas
   */
  private static generateSectorSpecificDevelopmentAreas(career: any, interests: string[], skills: string[]): string[] {
    const sector = career.sector;
    const title = career.title;
    const developmentAreas: string[] = [];
    
    switch (sector) {
      case 'healthcare':
        developmentAreas.push(
          `Medical terminology and healthcare knowledge for ${title}`,
          `Patient communication and bedside manner skills`,
          `Understanding of healthcare regulations and ethics`
        );
        break;
      case 'technology':
        developmentAreas.push(
          `Programming languages and technical skills for ${title}`,
          `Understanding of current technology trends`,
          `Project management and agile methodologies`
        );
        break;
      case 'infrastructure':
      case 'manufacturing':
        developmentAreas.push(
          `Technical and mechanical skills for ${title}`,
          `Safety protocols and OSHA regulations`,
          `Blueprint reading and technical documentation`
        );
        break;
      case 'creative':
        developmentAreas.push(
          `Design software proficiency for ${title}`,
          `Portfolio development and presentation skills`,
          `Understanding of design principles and color theory`
        );
        break;
      case 'education':
        developmentAreas.push(
          `Teaching methodologies and classroom management`,
          `Subject matter expertise for ${title}`,
          `Educational technology and digital tools`
        );
        break;
      case 'business':
      case 'finance':
        developmentAreas.push(
          `Financial analysis and business planning skills`,
          `Leadership and team management experience`,
          `Industry-specific knowledge for ${title}`
        );
        break;
      case 'hospitality':
        developmentAreas.push(
          `Culinary skills and food safety certification`,
          `Customer service excellence training`,
          `Restaurant operations and management`
        );
        break;
      case 'public-service':
        developmentAreas.push(
          `Public policy and government operations knowledge`,
          `Community engagement and public speaking`,
          `Legal and regulatory framework understanding`
        );
        break;
      case 'science':
        developmentAreas.push(
          `Research methodology and data analysis`,
          `Laboratory techniques and equipment operation`,
          `Scientific writing and publication skills`
        );
        break;
      case 'agriculture':
        developmentAreas.push(
          `Agricultural science and crop management`,
          `Sustainable farming practices`,
          `Equipment operation and maintenance`
        );
        break;
      case 'transportation':
        developmentAreas.push(
          `Transportation regulations and compliance`,
          `Vehicle operation and maintenance skills`,
          `Logistics and route optimization`
        );
        break;
      case 'retail':
        developmentAreas.push(
          `Sales techniques and customer psychology`,
          `Inventory management and retail operations`,
          `Product knowledge and market trends`
        );
        break;
      case 'legal':
        developmentAreas.push(
          `Legal research and case law analysis`,
          `Legal writing and documentation`,
          `Court procedures and legal ethics`
        );
        break;
      default:
        developmentAreas.push(
          `Industry-specific knowledge for ${title}`,
          `Professional communication skills`,
          `Technical competencies for the field`
        );
    }
    
    return developmentAreas;
  }

  /**
   * Generate sector-specific next steps
   */
  private static generateSectorSpecificNextSteps(career: any, profile: Partial<StudentProfile>): string[] {
    const sector = career.sector;
    const title = career.title;
    const nextSteps: string[] = [];
    
    switch (sector) {
      case 'healthcare':
        nextSteps.push(
          `Shadow healthcare professionals in ${title} roles`,
          `Volunteer at local hospitals or healthcare facilities`,
          `Take health sciences and biology courses in high school`,
          `Research nursing or healthcare programs at local colleges`
        );
        break;
      case 'technology':
        nextSteps.push(
          `Learn programming languages relevant to ${title}`,
          `Build a portfolio of technology projects`,
          `Join computer science clubs or coding bootcamps`,
          `Research computer science programs at universities`
        );
        break;
      case 'infrastructure':
      case 'manufacturing':
        nextSteps.push(
          `Visit construction sites or manufacturing facilities`,
          `Take shop class and technical education courses`,
          `Look into apprenticeship programs for ${title}`,
          `Research trade schools and technical colleges`
        );
        break;
      case 'creative':
        nextSteps.push(
          `Build a portfolio of creative work for ${title}`,
          `Learn design software like Adobe Creative Suite`,
          `Take art and design courses`,
          `Research art schools and design programs`
        );
        break;
      case 'education':
        nextSteps.push(
          `Volunteer as a tutor or teaching assistant`,
          `Take education and psychology courses`,
          `Observe classrooms in your area of interest`,
          `Research education programs at universities`
        );
        break;
      case 'business':
      case 'finance':
        nextSteps.push(
          `Take business and economics courses`,
          `Join business clubs like DECA or FBLA`,
          `Seek internships at local businesses`,
          `Research business programs at colleges`
        );
        break;
      case 'hospitality':
        nextSteps.push(
          `Get part-time work in restaurants or food service`,
          `Take culinary arts courses if available`,
          `Get food safety certification (ServSafe)`,
          `Research culinary schools and hospitality programs`
        );
        break;
      case 'public-service':
        nextSteps.push(
          `Volunteer with community organizations`,
          `Attend city council or school board meetings`,
          `Take government and civics courses`,
          `Research public administration programs`
        );
        break;
      case 'science':
        nextSteps.push(
          `Take advanced science and math courses`,
          `Participate in science fairs and research projects`,
          `Look for research opportunities at local universities`,
          `Research science programs and specializations`
        );
        break;
      case 'agriculture':
        nextSteps.push(
          `Join FFA (Future Farmers of America) if available`,
          `Visit local farms and agricultural operations`,
          `Take agriculture and environmental science courses`,
          `Research agricultural programs at universities`
        );
        break;
      case 'transportation':
        nextSteps.push(
          `Get your driver's license and practice safe driving`,
          `Learn about transportation regulations`,
          `Visit transportation companies or logistics centers`,
          `Research transportation and logistics programs`
        );
        break;
      case 'retail':
        nextSteps.push(
          `Get part-time retail experience`,
          `Learn about customer service best practices`,
          `Take business and marketing courses`,
          `Research retail management and business programs`
        );
        break;
      case 'legal':
        nextSteps.push(
          `Join debate team or mock trial club`,
          `Take government and civics courses`,
          `Visit local courts and law offices`,
          `Research pre-law programs and law schools`
        );
        break;
      default:
        nextSteps.push(
          `Research the ${title} field and career requirements`,
          `Connect with professionals working in ${title}`,
          `Take relevant courses to build foundational knowledge`,
          `Explore education and training options for ${title}`
        );
    }
    
    return nextSteps.slice(0, 4); // Return top 4 next steps
  }

  /**
   * Generate personalized career description
   */
  private static generatePersonalizedDescription(career: any, interests: string[], skills: string[]): string {
    const title = career.title;
    const sector = career.sector;
    const baseDescription = career.description || `${title} professionals work in the ${sector} sector.`;
    
    // Find connections to student interests
    const connections: string[] = [];
    
    if (interests.includes('Healthcare') || interests.includes('Helping Others')) {
      connections.push('helping people and making a positive impact on their lives');
    }
    if (interests.includes('Technology') || interests.includes('Innovation')) {
      connections.push('working with cutting-edge technology and innovative solutions');
    }
    if (interests.includes('Hands-on Work') || interests.includes('Building')) {
      connections.push('hands-on problem-solving and building tangible results');
    }
    if (interests.includes('Creative') || interests.includes('Art')) {
      connections.push('creative expression and artistic problem-solving');
    }
    if (interests.includes('Community Impact')) {
      connections.push('making a meaningful difference in your community');
    }
    
    let personalizedDescription = baseDescription;
    
    if (connections.length > 0) {
      personalizedDescription += ` This career is particularly well-suited for someone like you who enjoys ${connections.join(' and ')}. `;
    }
    
    // Add salary and growth context
    personalizedDescription += `With an average salary of ${career.averageSalary.toLocaleString()}, ${title} offers strong earning potential`;
    
    if (career.growthOutlook) {
      personalizedDescription += ` and ${career.growthOutlook.toLowerCase()} job growth prospects`;
    }
    
    personalizedDescription += '.';
    
    return personalizedDescription;
  }
}