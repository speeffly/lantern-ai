import { StudentProfile, AssessmentAnswer, CareerMatch } from '../types';

export interface ImprovedAssessmentResponse {
  assessmentVersion: 'v2' | 'v3';
  pathTaken: 'pathA' | 'pathB' | 'hard_hat' | 'non_hard_hat' | 'unable_to_decide' | 'decided' | 'undecided';
  responses: {
    basic_info: {
      grade: string;
      zipCode: string;
    };
    education_commitment: 'certificate' | 'associate' | 'bachelor' | 'advanced';
    // V2 fields
    career_clarity?: 'clear' | 'exploring' | 'unsure';
    career_category?: string;
    specific_career_interest?: string; // Path A only
    personal_traits?: string[]; // Path B only
    impact_legacy?: string; // Path B only
    inspiration?: string; // Path B only
    constraints_considerations?: string;
    // V3 fields
    work_preference_main?: 'hard_hat' | 'non_hard_hat' | 'unable_to_decide';
    hard_hat_specific?: string;
    non_hard_hat_specific?: string;
    interests_hobbies?: string;
    work_experience?: string;
    impact_and_inspiration?: string;
    career_constraints?: string;
    // Common fields
    subject_strengths: {
      [subject: string]: 'excellent' | 'good' | 'average' | 'struggling' | 'not_taken';
    };
  };
}

export interface ImprovedCareerMatch extends CareerMatch {
  category: string;
  pathSpecific: boolean;
  explanation: string;
  educationMatch: boolean;
  subjectAlignment: {
    subject: string;
    studentRating: string;
    relevance: 'high' | 'medium' | 'low';
  }[];
}

export class ImprovedCareerMatchingService {
  
  /**
   * Generate career matches using the improved v2 assessment structure
   */
  static async generateImprovedMatches(
    responses: ImprovedAssessmentResponse
  ): Promise<ImprovedCareerMatch[]> {
    console.log('🎯 Generating improved career matches for path:', responses.pathTaken);
    
    // Step 1: Filter careers by category selection
    const category = responses.responses.career_category || 
                    responses.responses.hard_hat_specific || 
                    responses.responses.non_hard_hat_specific || 
                    'unable_to_decide';
    const categoryMatches = this.filterCareersByCategory(category);
    
    // Step 2: Filter by education commitment
    const educationMatches = this.filterCareersByEducation(
      categoryMatches, 
      responses.responses.education_commitment
    );
    
    // Step 3: Score based on subject strengths
    const scoredMatches = this.scoreCareersBySubjects(
      educationMatches,
      responses.responses.subject_strengths
    );
    
    // Step 4: Apply path-specific logic
    const pathSpecificMatches = responses.pathTaken === 'pathA' 
      ? this.applyPathALogic(scoredMatches, responses)
      : this.applyPathBLogic(scoredMatches, responses);
    
    // Step 5: Generate clear explanations
    const explainedMatches = this.generateClearExplanations(pathSpecificMatches, responses);
    
    // Step 6: Sort by relevance and return top matches
    return explainedMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }
  
  /**
   * Filter careers by selected category (primary filter)
   */
  private static filterCareersByCategory(category: string): any[] {
    const categoryMapping = {
      'hard_hat_building': {
        sectors: ['infrastructure', 'manufacturing'],
        careers: ['Electrician', 'Plumber', 'Construction Worker', 'Welder', 'Heavy Equipment Operator']
      },
      'hard_hat_design': {
        sectors: ['infrastructure', 'creative'],
        careers: ['Architect', 'Civil Engineer', 'Structural Engineer', 'CAD Technician', 'Urban Planner']
      },
      'data_analysis': {
        sectors: ['business', 'finance', 'science'],
        careers: ['Data Analyst', 'Financial Analyst', 'Accountant', 'Statistician', 'Market Research Analyst']
      },
      'technology': {
        sectors: ['technology'],
        careers: ['Software Developer', 'Web Developer', 'IT Specialist', 'Cybersecurity Analyst', 'Database Administrator']
      },
      'education_coaching': {
        sectors: ['education'],
        careers: ['Teacher', 'School Counselor', 'Corporate Trainer', 'Tutor', 'Educational Coordinator']
      },
      'healthcare': {
        sectors: ['healthcare'],
        careers: ['Registered Nurse', 'Medical Assistant', 'Physical Therapist', 'Pharmacy Technician', 'Medical Technologist']
      },
      'public_safety': {
        sectors: ['public-service'],
        careers: ['Police Officer', 'Firefighter', 'EMT', 'Security Guard', 'Emergency Dispatcher']
      },
      'research_innovation': {
        sectors: ['science', 'technology'],
        careers: ['Research Scientist', 'Laboratory Technician', 'Environmental Scientist', 'Biomedical Engineer']
      },
      'creative_arts': {
        sectors: ['creative'],
        careers: ['Graphic Designer', 'Photographer', 'Musician', 'Writer', 'Art Director']
      }
    };
    
    const mapping = categoryMapping[category as keyof typeof categoryMapping];
    if (!mapping) {
      // If "unable_to_decide", return broader set
      return this.getAllCareers();
    }
    
    // Return careers that match the selected category
    return mapping.careers.map(title => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      sector: mapping.sectors[0], // Primary sector
      category,
      description: `${title} professional in ${mapping.sectors.join(' and ')} sector`,
      averageSalary: this.getAverageSalary(title),
      requiredEducation: this.getRequiredEducation(title),
      certifications: this.getCertifications(title),
      growthOutlook: 'Positive'
    }));
  }
  
  /**
   * Filter careers by education commitment (secondary filter)
   */
  private static filterCareersByEducation(careers: any[], educationLevel: string): any[] {
    const educationMapping = {
      'certificate': ['certificate', 'trade school'],
      'associate': ['certificate', 'associate', 'trade school'],
      'bachelor': ['certificate', 'associate', 'bachelor', 'trade school'],
      'advanced': ['certificate', 'associate', 'bachelor', 'master', 'doctorate', 'trade school']
    };
    
    const allowedEducation = educationMapping[educationLevel as keyof typeof educationMapping] || [];
    
    return careers.filter(career => 
      allowedEducation.some(level => 
        career.requiredEducation.toLowerCase().includes(level)
      )
    );
  }
  
  /**
   * Score careers based on subject strengths (tertiary scoring)
   */
  private static scoreCareersBySubjects(careers: any[], subjectStrengths: any): any[] {
    const subjectCareerMapping = {
      'math': ['Data Analyst', 'Financial Analyst', 'Accountant', 'Engineer', 'Statistician'],
      'science': ['Registered Nurse', 'Medical Assistant', 'Research Scientist', 'Laboratory Technician', 'Environmental Scientist'],
      'english': ['Teacher', 'Writer', 'School Counselor', 'Corporate Trainer'],
      'art': ['Graphic Designer', 'Photographer', 'Art Director', 'Musician'],
      'technology': ['Software Developer', 'Web Developer', 'IT Specialist', 'Cybersecurity Analyst'],
      'history': ['Teacher', 'Police Officer', 'School Counselor'],
      'physical_ed': ['Firefighter', 'EMT', 'Physical Therapist']
    };
    
    return careers.map(career => {
      let subjectScore = 50; // Base score
      let subjectAlignment: any[] = [];
      
      // Check each subject strength
      Object.entries(subjectStrengths).forEach(([subject, rating]) => {
        const relevantCareers = subjectCareerMapping[subject as keyof typeof subjectCareerMapping] || [];
        const isRelevant = relevantCareers.some(careerTitle => 
          career.title.includes(careerTitle) || careerTitle.includes(career.title)
        );
        
        if (isRelevant) {
          const ratingScore = {
            'excellent': 25,
            'good': 15,
            'average': 5,
            'struggling': -10,
            'not_taken': 0
          }[rating as string] || 0;
          
          subjectScore += ratingScore;
          
          subjectAlignment.push({
            subject,
            studentRating: rating,
            relevance: ratingScore > 15 ? 'high' : ratingScore > 5 ? 'medium' : 'low'
          });
        }
      });
      
      return {
        ...career,
        matchScore: Math.min(Math.max(subjectScore, 0), 100), // Clamp between 0-100
        subjectAlignment
      };
    });
  }
  
  /**
   * Apply Path A specific logic (Clear Direction students)
   */
  private static applyPathALogic(matches: any[], responses: ImprovedAssessmentResponse): any[] {
    const specificInterest = responses.responses.specific_career_interest?.toLowerCase() || '';
    
    return matches.map(match => {
      let pathBonus = 0;
      
      // Boost careers that match specific interest
      if (specificInterest && match.title.toLowerCase().includes(specificInterest)) {
        pathBonus += 20;
      }
      
      // Check for keyword matches in specific interest
      const keywords = specificInterest.split(' ');
      keywords.forEach(keyword => {
        if (keyword.length > 3 && match.title.toLowerCase().includes(keyword)) {
          pathBonus += 10;
        }
      });
      
      return {
        ...match,
        matchScore: Math.min(match.matchScore + pathBonus, 100),
        pathSpecific: pathBonus > 0
      };
    });
  }
  
  /**
   * Apply Path B specific logic (Uncertain students)
   */
  private static applyPathBLogic(matches: any[], responses: ImprovedAssessmentResponse): any[] {
    const traits = responses.responses.personal_traits || [];
    const impact = responses.responses.impact_legacy?.toLowerCase() || '';
    const inspiration = responses.responses.inspiration?.toLowerCase() || '';
    
    return matches.map(match => {
      let pathBonus = 0;
      
      // Boost based on personality traits
      traits.forEach(trait => {
        const traitCareerMapping = {
          'analytical': ['Data Analyst', 'Research Scientist', 'Financial Analyst'],
          'creative': ['Graphic Designer', 'Photographer', 'Art Director', 'Writer'],
          'helpful': ['Registered Nurse', 'Teacher', 'School Counselor', 'Medical Assistant'],
          'leader': ['Teacher', 'Police Officer', 'Firefighter'],
          'detail_oriented': ['Accountant', 'Laboratory Technician', 'Database Administrator'],
          'problem_solver': ['Software Developer', 'Engineer', 'IT Specialist'],
          'hands_on': ['Electrician', 'Plumber', 'Construction Worker', 'Welder']
        };
        
        const relevantCareers = traitCareerMapping[trait as keyof typeof traitCareerMapping] || [];
        if (relevantCareers.some(career => match.title.includes(career))) {
          pathBonus += 8;
        }
      });
      
      // Boost based on impact/legacy keywords
      const impactKeywords = ['help', 'save', 'teach', 'heal', 'build', 'create', 'protect'];
      impactKeywords.forEach(keyword => {
        if (impact.includes(keyword)) {
          const keywordCareerMapping = {
            'help': ['Teacher', 'School Counselor', 'Medical Assistant'],
            'save': ['Firefighter', 'EMT', 'Police Officer'],
            'teach': ['Teacher', 'Corporate Trainer', 'Tutor'],
            'heal': ['Registered Nurse', 'Physical Therapist', 'Medical Assistant'],
            'build': ['Construction Worker', 'Architect', 'Engineer'],
            'create': ['Graphic Designer', 'Photographer', 'Software Developer'],
            'protect': ['Police Officer', 'Firefighter', 'Security Guard']
          };
          
          const relevantCareers = keywordCareerMapping[keyword as keyof typeof keywordCareerMapping] || [];
          if (relevantCareers.some(career => match.title.includes(career))) {
            pathBonus += 5;
          }
        }
      });
      
      return {
        ...match,
        matchScore: Math.min(match.matchScore + pathBonus, 100),
        pathSpecific: pathBonus > 0
      };
    });
  }
  
  /**
   * Generate clear, specific explanations for career matches
   */
  private static generateClearExplanations(matches: any[], responses: ImprovedAssessmentResponse): ImprovedCareerMatch[] {
    return matches.map(match => {
      const category = responses.responses.career_category;
      const subjectStrengths = responses.responses.subject_strengths;
      const educationLevel = responses.responses.education_commitment;
      
      // Build explanation components
      const explanationParts: string[] = [];
      
      // Category connection
      const categoryLabels = {
        'healthcare': 'helping people improve their health',
        'technology': 'working with computers or technology',
        'education_coaching': 'helping people through education/coaching',
        'data_analysis': 'working with numbers, data, or analysis',
        'hard_hat_building': 'building, fixing, working with tools',
        'creative_arts': 'working with art and creative things'
      };
      
      const categoryLabel = categoryLabels[category as keyof typeof categoryLabels];
      if (categoryLabel) {
        explanationParts.push(`You selected "${categoryLabel}"`);
      }
      
      // Subject alignment
      const strongSubjects = Object.entries(subjectStrengths)
        .filter(([_, rating]) => rating === 'excellent' || rating === 'good')
        .map(([subject, rating]) => ({ subject, rating }));
      
      if (strongSubjects.length > 0) {
        const subjectList = strongSubjects
          .map(s => `${s.subject} (${s.rating})`)
          .join(' and ');
        explanationParts.push(`rated yourself well in ${subjectList}`);
      }
      
      // Education match
      const educationLabels = {
        'certificate': 'certificate or trade school training',
        'associate': '2-year college degree',
        'bachelor': '4-year university degree',
        'advanced': 'advanced degree'
      };
      
      const educationLabel = educationLabels[educationLevel];
      if (educationLabel) {
        explanationParts.push(`are willing to pursue ${educationLabel}`);
      }
      
      // Path-specific additions
      if (responses.pathTaken === 'pathA' && responses.responses.specific_career_interest) {
        explanationParts.push(`specifically mentioned interest in "${responses.responses.specific_career_interest}"`);
      }
      
      if (responses.pathTaken === 'pathB' && responses.responses.personal_traits) {
        const traits = responses.responses.personal_traits.slice(0, 2).join(' and ');
        explanationParts.push(`described yourself as ${traits}`);
      }
      
      // Combine explanation
      const explanation = explanationParts.length > 0
        ? `This ${match.title} career matches because you ${explanationParts.join(', ')}, which directly aligns with the requirements and nature of ${match.title} work.`
        : `This ${match.title} career aligns with your selected preferences and shows strong potential for career satisfaction.`;
      
      return {
        ...match,
        category,
        pathSpecific: match.pathSpecific || false,
        explanation,
        educationMatch: true, // Already filtered by education
        subjectAlignment: match.subjectAlignment || []
      } as ImprovedCareerMatch;
    });
  }
  
  // Helper methods for career data
  private static getAllCareers(): any[] {
    // Return a broader set of careers for uncertain students
    return [
      // Sample careers from multiple categories
      { title: 'Registered Nurse', sector: 'healthcare' },
      { title: 'Software Developer', sector: 'technology' },
      { title: 'Teacher', sector: 'education' },
      { title: 'Electrician', sector: 'infrastructure' },
      { title: 'Graphic Designer', sector: 'creative' }
    ];
  }
  
  private static getAverageSalary(title: string): number {
    const salaryMap: { [key: string]: number } = {
      'Registered Nurse': 75000,
      'Software Developer': 85000,
      'Teacher': 50000,
      'Electrician': 65000,
      'Graphic Designer': 55000,
      'Data Analyst': 70000,
      'Police Officer': 60000,
      'Firefighter': 55000
    };
    return salaryMap[title] || 50000;
  }
  
  private static getRequiredEducation(title: string): string {
    const educationMap: { [key: string]: string } = {
      'Registered Nurse': 'Associate degree',
      'Software Developer': 'Bachelor degree',
      'Teacher': 'Bachelor degree',
      'Electrician': 'Certificate',
      'Graphic Designer': 'Bachelor degree',
      'Data Analyst': 'Bachelor degree',
      'Police Officer': 'Certificate',
      'Firefighter': 'Certificate'
    };
    return educationMap[title] || 'Certificate';
  }
  
  private static getCertifications(title: string): string[] {
    const certMap: { [key: string]: string[] } = {
      'Registered Nurse': ['RN License', 'CPR Certification'],
      'Software Developer': ['Programming Certifications'],
      'Teacher': ['Teaching License', 'Subject Certification'],
      'Electrician': ['Electrical License', 'OSHA Safety'],
      'Police Officer': ['Police Academy', 'Firearms Training'],
      'Firefighter': ['Fire Academy', 'EMT Certification']
    };
    return certMap[title] || ['Professional Certification'];
  }
}