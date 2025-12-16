export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applicationUrl: string;
  source: 'indeed' | 'linkedin' | 'local' | 'government';
  experienceLevel: 'entry' | 'mid' | 'senior';
  educationRequired: string;
  distanceFromStudent?: number;
}

export class JobListingService {
  /**
   * Get job listings for a specific career and location
   */
  static async getJobListings(
    careerTitle: string,
    zipCode: string,
    radiusMiles: number = 40,
    limit: number = 10
  ): Promise<JobListing[]> {
    try {
      // In a real implementation, this would call job APIs
      // For demo purposes, we'll return mock data that looks realistic
      
      const mockJobs = this.generateMockJobs(careerTitle, zipCode);
      
      // Filter and sort by relevance and distance
      return mockJobs
        .filter(job => (job.distanceFromStudent || 0) <= radiusMiles)
        .sort((a, b) => (a.distanceFromStudent || 0) - (b.distanceFromStudent || 0))
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error fetching job listings:', error);
      return [];
    }
  }

  /**
   * Generate realistic mock job listings for demo
   */
  private static generateMockJobs(careerTitle: string, zipCode: string): JobListing[] {
    const baseJobs = this.getJobTemplates(careerTitle);
    const locations = this.generateNearbyLocations(zipCode);
    
    return baseJobs.map((template, index) => ({
      ...template,
      id: `job_${Date.now()}_${index}`,
      location: locations[index % locations.length],
      distanceFromStudent: Math.floor(Math.random() * 35) + 5, // 5-40 miles
      postedDate: this.getRandomRecentDate(),
      applicationUrl: this.generateApplicationUrl(template.company!, template.title!)
    } as JobListing));
  }

  /**
   * Get job templates based on career type
   */
  private static getJobTemplates(careerTitle: string): Omit<JobListing, 'id' | 'location' | 'distanceFromStudent' | 'postedDate' | 'applicationUrl'>[] {
    const templates: { [key: string]: Omit<JobListing, 'id' | 'location' | 'distanceFromStudent' | 'postedDate' | 'applicationUrl'>[] } = {
      'Registered Nurse': [
        {
          title: 'Registered Nurse - Med/Surg',
          company: 'Regional Medical Center',
          salary: '$70,000 - $85,000',
          description: 'Provide direct patient care in medical-surgical unit. Work with interdisciplinary team to deliver quality healthcare.',
          requirements: ['RN License', 'BSN preferred', '1+ years experience preferred', 'BLS certification'],
          source: 'indeed',
          experienceLevel: 'entry',
          educationRequired: 'Associate Degree'
        },
        {
          title: 'Staff Nurse - Emergency Department',
          company: 'Community Hospital',
          salary: '$75,000 - $90,000',
          description: 'Fast-paced emergency department seeking compassionate RN. Trauma experience a plus.',
          requirements: ['RN License', 'ACLS certification', 'Emergency experience preferred', 'Strong communication skills'],
          source: 'linkedin',
          experienceLevel: 'entry',
          educationRequired: 'Associate Degree'
        },
        {
          title: 'New Graduate RN Program',
          company: 'Rural Health Network',
          salary: '$65,000 - $75,000',
          description: 'Comprehensive orientation program for new graduate nurses. Mentorship and continuing education provided.',
          requirements: ['RN License', 'New graduate or <1 year experience', 'BSN preferred', 'Commitment to rural healthcare'],
          source: 'local',
          experienceLevel: 'entry',
          educationRequired: 'Associate Degree'
        }
      ],
      'Electrician': [
        {
          title: 'Apprentice Electrician',
          company: 'County Electric Co.',
          salary: '$35,000 - $45,000',
          description: 'Learn electrical trade through hands-on experience. Work on residential and commercial projects.',
          requirements: ['High school diploma', 'Valid driver\'s license', 'Physical ability to lift 50lbs', 'Willingness to learn'],
          source: 'indeed',
          experienceLevel: 'entry',
          educationRequired: 'High School'
        },
        {
          title: 'Journeyman Electrician',
          company: 'Industrial Power Solutions',
          salary: '$55,000 - $70,000',
          description: 'Install and maintain electrical systems in industrial facilities. Some travel required.',
          requirements: ['Journeyman license', '3+ years experience', 'Industrial experience preferred', 'Own tools'],
          source: 'linkedin',
          experienceLevel: 'mid',
          educationRequired: 'Certificate'
        },
        {
          title: 'Electrical Trainee',
          company: 'Municipal Utilities',
          salary: '$40,000 - $50,000',
          description: 'Entry-level position with full benefits. Training provided for power line maintenance.',
          requirements: ['High school diploma', 'CDL preferred', 'No experience required', 'Physical fitness required'],
          source: 'government',
          experienceLevel: 'entry',
          educationRequired: 'High School'
        }
      ],
      'Medical Assistant': [
        {
          title: 'Medical Assistant - Family Practice',
          company: 'Family Health Clinic',
          salary: '$32,000 - $38,000',
          description: 'Support physicians in busy family practice. Patient interaction and clinical duties.',
          requirements: ['Medical Assistant certification', 'EHR experience preferred', 'Excellent communication', 'Bilingual a plus'],
          source: 'indeed',
          experienceLevel: 'entry',
          educationRequired: 'Certificate'
        },
        {
          title: 'Clinical Medical Assistant',
          company: 'Specialty Care Associates',
          salary: '$35,000 - $42,000',
          description: 'Work in specialty clinic performing clinical and administrative duties.',
          requirements: ['CMA certification', '1+ years experience', 'Phlebotomy skills', 'Computer proficiency'],
          source: 'local',
          experienceLevel: 'entry',
          educationRequired: 'Certificate'
        }
      ]
    };

    // Return jobs for the specific career, or generic jobs if not found
    return templates[careerTitle] || templates['Registered Nurse'];
  }

  /**
   * Generate nearby locations based on ZIP code
   */
  private static generateNearbyLocations(zipCode: string): string[] {
    // In a real implementation, this would use geocoding APIs
    return [
      'Downtown Medical District',
      'Westside Industrial Park',
      'County Hospital Campus',
      'Main Street Business District',
      'Regional Shopping Center',
      'University Medical Center',
      'North County Facility',
      'Southside Community Center'
    ];
  }

  /**
   * Generate a random recent date for job posting
   */
  private static getRandomRecentDate(): string {
    const daysAgo = Math.floor(Math.random() * 14) + 1; // 1-14 days ago
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate application URL (in real implementation, would be actual URLs)
   */
  private static generateApplicationUrl(company: string, title: string): string {
    const slug = `${company}-${title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `https://careers.example.com/jobs/${slug}`;
  }

  /**
   * Get entry-level jobs suitable for high school students
   */
  static async getEntryLevelJobs(zipCode: string, limit: number = 5): Promise<JobListing[]> {
    const entryLevelCareers = ['Medical Assistant', 'Electrician', 'Construction Worker'];
    const allJobs: JobListing[] = [];

    for (const career of entryLevelCareers) {
      const jobs = await this.getJobListings(career, zipCode, 40, 3);
      allJobs.push(...jobs.filter(job => job.experienceLevel === 'entry'));
    }

    return allJobs
      .sort((a, b) => (a.distanceFromStudent || 0) - (b.distanceFromStudent || 0))
      .slice(0, limit);
  }

  /**
   * Search jobs by keywords and location
   */
  static async searchJobs(
    keywords: string,
    zipCode: string,
    radiusMiles: number = 40,
    limit: number = 20
  ): Promise<JobListing[]> {
    // In real implementation, this would search across multiple job APIs
    const relevantCareers = this.findRelevantCareers(keywords);
    const allJobs: JobListing[] = [];

    for (const career of relevantCareers) {
      const jobs = await this.getJobListings(career, zipCode, radiusMiles, 5);
      allJobs.push(...jobs);
    }

    return allJobs
      .filter(job => 
        job.title.toLowerCase().includes(keywords.toLowerCase()) ||
        job.description.toLowerCase().includes(keywords.toLowerCase())
      )
      .slice(0, limit);
  }

  /**
   * Find careers relevant to search keywords
   */
  private static findRelevantCareers(keywords: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'nurse': ['Registered Nurse'],
      'medical': ['Medical Assistant', 'Registered Nurse'],
      'electric': ['Electrician'],
      'construction': ['Electrician', 'Construction Worker'],
      'healthcare': ['Registered Nurse', 'Medical Assistant'],
      'infrastructure': ['Electrician', 'Construction Worker']
    };

    const lowerKeywords = keywords.toLowerCase();
    const relevantCareers: string[] = [];

    for (const [key, careers] of Object.entries(keywordMap)) {
      if (lowerKeywords.includes(key)) {
        relevantCareers.push(...careers);
      }
    }

    return [...new Set(relevantCareers)]; // Remove duplicates
  }
}