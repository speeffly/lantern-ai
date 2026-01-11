import { CareerMatch } from '../types';

export interface LocalJobMarket {
  zipCode: string;
  radius: number; // miles
  jobOpportunities: LocalJobListing[];
  marketTrends: MarketTrend[];
  averageSalaries: { [careerTitle: string]: number };
}

export interface LocalJobListing {
  id: string;
  title: string;
  company: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
    distance: number; // miles from student
  };
  salary: {
    min: number;
    max: number;
    type: 'hourly' | 'annual';
  };
  requirements: {
    education: string;
    experience: string;
    certifications: string[];
    skills: string[];
  };
  description: string;
  postedDate: Date;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  benefits: string[];
  matchScore: number;
}

export interface MarketTrend {
  career: string;
  demand: 'High' | 'Medium' | 'Low';
  growth: number; // percentage
  openings: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  averageTimeToHire: number; // days
}

export class LocalJobMarketService {
  private static readonly MAX_RADIUS = 40; // miles

  /**
   * Get local job market data within 40 miles
   */
  static async getLocalJobMarket(
    zipCode: string,
    careerMatches: CareerMatch[]
  ): Promise<LocalJobMarket> {
    try {
      // console.log(`🔍 Searching job market within ${this.MAX_RADIUS} miles of ZIP ${zipCode}`);

      // In production, this would integrate with job APIs like:
      // - Indeed API
      // - LinkedIn Jobs API
      // - USAJobs API
      // - Local government job boards
      // - Healthcare-specific job boards
      
      const jobOpportunities = await this.searchJobListings(zipCode, careerMatches);
      const marketTrends = this.analyzeMarketTrends(zipCode, careerMatches);
      const averageSalaries = this.calculateAverageSalaries(jobOpportunities);

      return {
        zipCode,
        radius: this.MAX_RADIUS,
        jobOpportunities,
        marketTrends,
        averageSalaries
      };
    } catch (error) {
      // console.error('❌ Local job market search failed:', error);
      return this.getFallbackJobMarket(zipCode, careerMatches);
    }
  }

  /**
   * Search for job listings (simulated - would use real APIs in production)
   */
  private static async searchJobListings(
    zipCode: string,
    careerMatches: CareerMatch[]
  ): Promise<LocalJobListing[]> {
    const jobs: LocalJobListing[] = [];
    
    // Simulate job listings for each career match
    careerMatches.slice(0, 5).forEach((match, index) => {
      const career = match.career;
      
      // Generate 2-4 job listings per career
      const numJobs = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numJobs; i++) {
        const distance = 5 + Math.floor(Math.random() * 35); // 5-40 miles
        const company = this.generateCompanyName(career.sector, i);
        const location = this.generateLocation(zipCode, distance);
        
        jobs.push({
          id: `job-${career.id}-${i}`,
          title: this.generateJobTitle(career.title, i),
          company,
          location,
          salary: this.generateSalaryRange(career.averageSalary),
          requirements: {
            education: career.requiredEducation,
            experience: i === 0 ? 'Entry level' : `${i}-${i+2} years`,
            certifications: career.certifications || [],
            skills: this.generateRequiredSkills(career)
          },
          description: this.generateJobDescription(career, company),
          postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
          employmentType: 'full-time',
          benefits: this.generateBenefits(career.sector),
          matchScore: Math.max(60, match.matchScore - (i * 5)) // Decrease match score for additional jobs
        });
      }
    });

    // Sort by distance and match score
    return jobs.sort((a, b) => {
      const distanceWeight = 0.3;
      const matchWeight = 0.7;
      
      const scoreA = (40 - a.location.distance) * distanceWeight + a.matchScore * matchWeight;
      const scoreB = (40 - b.location.distance) * distanceWeight + b.matchScore * matchWeight;
      
      return scoreB - scoreA;
    });
  }

  /**
   * Generate company name based on sector
   */
  private static generateCompanyName(sector: string, index: number): string {
    if (sector === 'healthcare') {
      const healthcareCompanies = [
        'Regional Medical Center',
        'Community Health Services',
        'Family Care Clinic',
        'Rural Health Network',
        'County Hospital System'
      ];
      return healthcareCompanies[index % healthcareCompanies.length];
    } else {
      const infrastructureCompanies = [
        'Local Construction Co.',
        'Regional Utilities',
        'County Public Works',
        'Infrastructure Solutions LLC',
        'Rural Development Corp.'
      ];
      return infrastructureCompanies[index % infrastructureCompanies.length];
    }
  }

  /**
   * Generate location within radius
   */
  private static generateLocation(zipCode: string, distance: number) {
    const cities = [
      'Springfield', 'Franklin', 'Georgetown', 'Madison', 'Clinton',
      'Washington', 'Jefferson', 'Lincoln', 'Jackson', 'Monroe'
    ];
    
    return {
      city: cities[Math.floor(Math.random() * cities.length)],
      state: 'State', // Would be determined by ZIP code in production
      zipCode: (parseInt(zipCode) + Math.floor(Math.random() * 100)).toString(),
      distance
    };
  }

  /**
   * Generate job title variations
   */
  private static generateJobTitle(baseTitle: string, index: number): string {
    const prefixes = ['', 'Entry Level ', 'Junior ', 'Associate ', 'Staff '];
    const suffixes = ['', ' I', ' - New Grad', ' (Entry Level)', ' Trainee'];
    
    if (index === 0) return baseTitle;
    
    const prefix = prefixes[index % prefixes.length];
    const suffix = suffixes[index % suffixes.length];
    
    return `${prefix}${baseTitle}${suffix}`;
  }

  /**
   * Generate salary range based on base salary
   */
  private static generateSalaryRange(baseSalary: number) {
    const variation = 0.15; // ±15% variation
    const min = Math.round(baseSalary * (1 - variation));
    const max = Math.round(baseSalary * (1 + variation));
    
    return {
      min,
      max,
      type: 'annual' as const
    };
  }

  /**
   * Generate required skills for job
   */
  private static generateRequiredSkills(career: any): string[] {
    const commonSkills = ['Communication', 'Teamwork', 'Problem Solving', 'Time Management'];
    const sectorSkills = career.sector === 'healthcare' 
      ? ['Patient Care', 'Medical Terminology', 'HIPAA Compliance', 'Electronic Health Records']
      : ['Safety Protocols', 'Technical Skills', 'Blueprint Reading', 'Equipment Operation'];
    
    return [...commonSkills.slice(0, 2), ...sectorSkills.slice(0, 3)];
  }

  /**
   * Generate job description
   */
  private static generateJobDescription(career: any, company: string): string {
    return `${company} is seeking a dedicated ${career.title} to join our team. ` +
           `Responsibilities include ${career.responsibilities?.slice(0, 2).join(', ').toLowerCase() || 'various duties'}. ` +
           `This is an excellent opportunity for someone looking to start or advance their career in ${career.sector}. ` +
           `We offer competitive compensation and comprehensive benefits.`;
  }

  /**
   * Generate benefits package
   */
  private static generateBenefits(sector: string): string[] {
    const commonBenefits = ['Health Insurance', 'Paid Time Off', '401(k) Plan'];
    const sectorBenefits = sector === 'healthcare'
      ? ['Medical/Dental/Vision', 'Continuing Education', 'Flexible Scheduling']
      : ['Safety Training', 'Tool Allowance', 'Overtime Opportunities'];
    
    return [...commonBenefits, ...sectorBenefits];
  }

  /**
   * Analyze market trends
   */
  private static analyzeMarketTrends(
    zipCode: string,
    careerMatches: CareerMatch[]
  ): MarketTrend[] {
    return careerMatches.slice(0, 5).map(match => {
      const career = match.career;
      
      // Simulate market analysis based on career sector and growth outlook
      const isHealthcare = career.sector === 'healthcare';
      const hasHighGrowth = career.growthOutlook?.includes('faster') || career.growthOutlook?.includes('Much faster');
      
      return {
        career: career.title,
        demand: isHealthcare ? 'High' : hasHighGrowth ? 'Medium' : 'Low',
        growth: this.parseGrowthRate(career.growthOutlook || ''),
        openings: Math.floor(Math.random() * 50) + 10, // 10-60 openings
        competitionLevel: isHealthcare ? 'Medium' : 'Low',
        averageTimeToHire: Math.floor(Math.random() * 30) + 15 // 15-45 days
      };
    });
  }

  /**
   * Parse growth rate from outlook string
   */
  private static parseGrowthRate(outlook: string): number {
    if (outlook.includes('Much faster')) return Math.floor(Math.random() * 5) + 10; // 10-15%
    if (outlook.includes('faster')) return Math.floor(Math.random() * 3) + 5; // 5-8%
    if (outlook.includes('average')) return Math.floor(Math.random() * 3) + 2; // 2-5%
    if (outlook.includes('slower')) return Math.floor(Math.random() * 2); // 0-2%
    return 3; // Default 3%
  }

  /**
   * Calculate average salaries from job listings
   */
  private static calculateAverageSalaries(jobs: LocalJobListing[]): { [careerTitle: string]: number } {
    const salaries: { [key: string]: number[] } = {};
    
    jobs.forEach(job => {
      const baseTitle = job.title.replace(/^(Entry Level |Junior |Associate |Staff )/, '').replace(/ (I|II|III|- New Grad|\(Entry Level\)| Trainee)$/, '');
      
      if (!salaries[baseTitle]) {
        salaries[baseTitle] = [];
      }
      
      salaries[baseTitle].push((job.salary.min + job.salary.max) / 2);
    });
    
    const averages: { [key: string]: number } = {};
    Object.keys(salaries).forEach(title => {
      const titleSalaries = salaries[title];
      averages[title] = Math.round(titleSalaries.reduce((a, b) => a + b, 0) / titleSalaries.length);
    });
    
    return averages;
  }

  /**
   * Fallback job market data when API calls fail
   */
  private static getFallbackJobMarket(
    zipCode: string,
    careerMatches: CareerMatch[]
  ): LocalJobMarket {
    return {
      zipCode,
      radius: this.MAX_RADIUS,
      jobOpportunities: [],
      marketTrends: careerMatches.slice(0, 3).map(match => ({
        career: match.career.title,
        demand: 'Medium',
        growth: 5,
        openings: 25,
        competitionLevel: 'Medium',
        averageTimeToHire: 30
      })),
      averageSalaries: careerMatches.reduce((acc, match) => {
        acc[match.career.title] = match.career.averageSalary;
        return acc;
      }, {} as { [key: string]: number })
    };
  }

  /**
   * Get job search tips for rural students
   */
  static getJobSearchTips(sector: string): string[] {
    const commonTips = [
      'Network with local professionals in your field',
      'Consider remote work opportunities',
      'Look into apprenticeship programs',
      'Connect with your school\'s career counselor'
    ];

    const sectorTips = sector === 'healthcare' 
      ? [
          'Volunteer at local hospitals or clinics',
          'Join health professional student organizations',
          'Consider starting with CNA or medical assistant roles',
          'Look into rural health scholarship programs'
        ]
      : [
          'Contact local contractors and utility companies',
          'Look into union apprenticeship programs',
          'Consider starting with entry-level construction jobs',
          'Attend local job fairs and trade shows'
        ];

    return [...commonTips, ...sectorTips];
  }
}