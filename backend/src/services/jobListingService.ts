import { RealJobProvider } from './realJobProvider';
import OpenAI from 'openai';

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
  requiresRelocation?: boolean;
  originalSearchRadius?: number;
  nearbyCity?: string;
}

export class JobListingService {
  /**
   * Get job listings for a specific career and location
   */
  static async getJobListings(
    careerTitle: string,
    zipCode: string,
    radiusMiles: number = 40,
    limit: number = 10,
    willingToRelocate: boolean = false
  ): Promise<JobListing[]> {
    try {
      // First, try to get real jobs in the immediate area
      const localJobs = await RealJobProvider.searchJobs({
        careerTitle,
        zipCode,
        radiusMiles,
        limit
      });

      if (localJobs.length > 0) {
        // console.log(`🟢 Using real jobs for career "${careerTitle}" in ${zipCode}: ${localJobs.length} found`);
        return localJobs.slice(0, limit);
      }

      // If no local jobs found and user is willing to relocate, expand search
      if (willingToRelocate && localJobs.length === 0) {
        console.log(`🔍 No local jobs found, expanding search for willing-to-relocate user`);
        
        // Try expanded radius first (up to 100 miles)
        const expandedJobs = await RealJobProvider.searchJobs({
          careerTitle,
          zipCode,
          radiusMiles: 100,
          limit
        });

        if (expandedJobs.length > 0) {
          // Mark jobs as requiring relocation if they're beyond original radius
          const markedJobs = expandedJobs.map(job => ({
            ...job,
            requiresRelocation: (job.distanceFromStudent || 0) > radiusMiles,
            originalSearchRadius: radiusMiles
          }));
          console.log(`🟢 Found ${expandedJobs.length} jobs in expanded area`);
          return markedJobs.slice(0, limit);
        }

        // Try nearby major cities/zip codes
        const nearbyZipCodes = this.getNearbyZipCodes(zipCode);
        const nearbyJobs: JobListing[] = [];

        for (const nearbyZip of nearbyZipCodes) {
          if (nearbyJobs.length >= limit) break;
          
          const jobs = await RealJobProvider.searchJobs({
            careerTitle,
            zipCode: nearbyZip.zipCode,
            radiusMiles: 25, // Smaller radius for nearby cities
            limit: Math.max(3, limit - nearbyJobs.length)
          });

          // Add location context to jobs from other cities
          const contextualJobs = jobs.map(job => ({
            ...job,
            location: `${job.location} (${nearbyZip.city})`,
            distanceFromStudent: nearbyZip.distanceMiles,
            requiresRelocation: true,
            originalSearchRadius: radiusMiles,
            nearbyCity: nearbyZip.city
          }));

          nearbyJobs.push(...contextualJobs);
        }

        if (nearbyJobs.length > 0) {
          console.log(`🟢 Found ${nearbyJobs.length} jobs in nearby cities`);
          return nearbyJobs.slice(0, limit);
        }
      }

      // If still no real jobs, fall back to mock data (but avoid junk links for non-relocating users)
      if (!willingToRelocate) {
        // For users not willing to relocate, return empty instead of junk mock jobs
        console.log(`🔴 No local jobs found and user not willing to relocate`);
        return [];
      }

      // For willing-to-relocate users, generate realistic mock jobs with proper context
      console.log(`🟠 Falling back to contextual mock jobs for career "${careerTitle}"`);
      const mockJobs = this.generateRelocatingMockJobs(careerTitle, zipCode);
      return mockJobs
        .filter(job => (job.distanceFromStudent || 0) <= 100) // Expanded radius for relocating users
        .sort((a, b) => (a.distanceFromStudent || 0) - (b.distanceFromStudent || 0))
        .slice(0, limit);
        
    } catch (error) {
      // console.error('Error fetching job listings:', error);
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
   * Generate nearby locations based on ZIP code
   */
  private static generateNearbyLocations(zipCode: string): string[] {
    // Simple location generation based on ZIP code prefix
    const prefix = zipCode.substring(0, 2);
    const locationMap: {[key: string]: string[]} = {
      '78': ['Austin, TX', 'Round Rock, TX', 'Cedar Park, TX'],
      '94': ['San Francisco, CA', 'Oakland, CA', 'San Jose, CA'],
      '10': ['New York, NY', 'Brooklyn, NY', 'Queens, NY'],
      '60': ['Chicago, IL', 'Evanston, IL', 'Naperville, IL'],
      '33': ['Miami, FL', 'Fort Lauderdale, FL', 'Hollywood, FL'],
      'default': ['Local Area', 'Nearby City', 'Metro Area']
    };
    
    return locationMap[prefix] || locationMap['default'];
  }

  /**
   * Get job templates based on career type
   */
  private static getJobTemplates(careerTitle: string): Omit<JobListing, 'id' | 'location' | 'distanceFromStudent' | 'postedDate' | 'applicationUrl'>[] {
    // Minimal generic templates to avoid hardcoded manual jobs; rely on real provider whenever possible
    const title = careerTitle || 'Job Opportunity';
    return [
      {
        title: `${title} - Local Opportunity`,
        company: 'Local Employer',
        salary: undefined,
        description: `Explore ${title} roles in your area.`,
        requirements: [],
        source: 'local',
        experienceLevel: 'entry',
        educationRequired: 'Not specified'
      }
    ];
  }

  /**
   * Get nearby major cities/zip codes for expanded job search
   */
  private static getNearbyZipCodes(zipCode: string): Array<{zipCode: string, city: string, distanceMiles: number}> {
    // This is a simplified implementation. In production, you'd use a geocoding service
    // or a comprehensive zip code database with actual distances
    const zipToRegion: {[key: string]: Array<{zipCode: string, city: string, distanceMiles: number}>} = {
      // Texas (Austin area - 78xxx)
      '78': [
        { zipCode: '75201', city: 'Dallas', distanceMiles: 195 },
        { zipCode: '77001', city: 'Houston', distanceMiles: 165 },
        { zipCode: '78201', city: 'San Antonio', distanceMiles: 80 }
      ],
      // California (San Francisco area - 94xxx)
      '94': [
        { zipCode: '90210', city: 'Los Angeles', distanceMiles: 380 },
        { zipCode: '95101', city: 'San Jose', distanceMiles: 50 },
        { zipCode: '92101', city: 'San Diego', distanceMiles: 500 }
      ],
      // New York (NYC area - 10xxx)
      '10': [
        { zipCode: '19101', city: 'Philadelphia', distanceMiles: 95 },
        { zipCode: '02101', city: 'Boston', distanceMiles: 215 },
        { zipCode: '20001', city: 'Washington DC', distanceMiles: 225 }
      ],
      // Illinois (Chicago area - 60xxx)
      '60': [
        { zipCode: '53201', city: 'Milwaukee', distanceMiles: 90 },
        { zipCode: '46201', city: 'Indianapolis', distanceMiles: 185 },
        { zipCode: '63101', city: 'St. Louis', distanceMiles: 300 }
      ],
      // Florida (Miami area - 33xxx)
      '33': [
        { zipCode: '32801', city: 'Orlando', distanceMiles: 235 },
        { zipCode: '33601', city: 'Tampa', distanceMiles: 280 },
        { zipCode: '32301', city: 'Tallahassee', distanceMiles: 470 }
      ],
      // Default major cities for other areas
      'default': [
        { zipCode: '10001', city: 'New York', distanceMiles: 250 },
        { zipCode: '90210', city: 'Los Angeles', distanceMiles: 300 },
        { zipCode: '60601', city: 'Chicago', distanceMiles: 200 }
      ]
    };

    const prefix = zipCode.substring(0, 2);
    return zipToRegion[prefix] || zipToRegion['default'];
  }

  /**
   * Generate realistic mock jobs for users willing to relocate
   */
  private static generateRelocatingMockJobs(careerTitle: string, zipCode: string): JobListing[] {
    const nearbyAreas = this.getNearbyZipCodes(zipCode);
    const jobs: JobListing[] = [];

    nearbyAreas.forEach((area, index) => {
      const job: JobListing = {
        id: `relocate_${Date.now()}_${index}`,
        title: `${careerTitle} - ${area.city} Opportunity`,
        company: `${area.city} Employer`,
        location: `${area.city} Metro Area`,
        salary: this.generateRealisticSalary(careerTitle),
        description: `Exciting ${careerTitle} opportunity in ${area.city}. This position offers growth potential in a dynamic market.`,
        requirements: this.getCareerRequirements(careerTitle),
        postedDate: this.getRandomRecentDate(),
        applicationUrl: `https://jobs.${area.city.toLowerCase().replace(/\s+/g, '')}.gov/careers/${careerTitle.toLowerCase().replace(/\s+/g, '-')}`,
        source: 'local',
        experienceLevel: 'entry',
        educationRequired: this.getEducationRequirement(careerTitle),
        distanceFromStudent: area.distanceMiles,
        requiresRelocation: true,
        nearbyCity: area.city
      };
      jobs.push(job);
    });

    return jobs;
  }

  /**
   * Generate realistic salary ranges based on career type
   */
  private static generateRealisticSalary(careerTitle: string): string {
    const salaryRanges: {[key: string]: {min: number, max: number}} = {
      'registered nurse': { min: 65000, max: 85000 },
      'electrician': { min: 45000, max: 70000 },
      'software developer': { min: 70000, max: 120000 },
      'medical assistant': { min: 35000, max: 45000 },
      'construction worker': { min: 35000, max: 55000 },
      'teacher': { min: 40000, max: 60000 },
      'mechanic': { min: 40000, max: 65000 },
      'default': { min: 35000, max: 55000 }
    };

    const key = careerTitle.toLowerCase();
    const range = salaryRanges[key] || salaryRanges['default'];
    return `$${range.min.toLocaleString()} - $${range.max.toLocaleString()}`;
  }

  /**
   * Get realistic requirements based on career type
   */
  private static getCareerRequirements(careerTitle: string): string[] {
    const requirements: {[key: string]: string[]} = {
      'registered nurse': ['RN License', 'BSN Preferred', 'CPR Certification'],
      'electrician': ['Electrical License', 'OSHA 10', 'Trade School Certificate'],
      'software developer': ['Programming Skills', 'Computer Science Degree', 'Portfolio'],
      'medical assistant': ['Medical Assistant Certification', 'CPR Certification'],
      'construction worker': ['Physical Fitness', 'Safety Training', 'Reliable Transportation'],
      'teacher': ['Teaching License', 'Education Degree', 'Background Check'],
      'mechanic': ['ASE Certification', 'Technical Training', 'Tool Proficiency'],
      'default': ['High School Diploma', 'Reliable Transportation', 'Good Communication']
    };

    return requirements[careerTitle.toLowerCase()] || requirements['default'];
  }

  /**
   * Get education requirements based on career type
   */
  private static getEducationRequirement(careerTitle: string): string {
    const education: {[key: string]: string} = {
      'registered nurse': 'Associate or Bachelor\'s Degree in Nursing',
      'electrician': 'Trade School or Apprenticeship',
      'software developer': 'Bachelor\'s Degree in Computer Science',
      'medical assistant': 'Certificate or Associate Degree',
      'construction worker': 'High School Diploma',
      'teacher': 'Bachelor\'s Degree + Teaching License',
      'mechanic': 'Technical Certificate or Associate Degree',
      'default': 'High School Diploma or Equivalent'
    };

    return education[careerTitle.toLowerCase()] || education['default'];
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
    limit: number = 20,
    willingToRelocate: boolean = false
  ): Promise<JobListing[]> {
    // Prefer real jobs when enabled and available (try keyword-first)
    const realJobs = await RealJobProvider.searchJobs({
      keywords,
      zipCode,
      radiusMiles,
      limit
    });

    if (realJobs.length > 0) {
      // console.log(`🟢 Using real jobs for search "${keywords}" in ${zipCode}: ${realJobs.length} found`);
      return realJobs.slice(0, limit);
    }

    // If no keyword hits and user willing to relocate, try expanded search
    if (willingToRelocate) {
      const expandedResults = await RealJobProvider.searchJobs({
        keywords,
        zipCode,
        radiusMiles: 100,
        limit
      });

      if (expandedResults.length > 0) {
        const markedJobs = expandedResults.map(job => ({
          ...job,
          requiresRelocation: (job.distanceFromStudent || 0) > radiusMiles,
          originalSearchRadius: radiusMiles
        }));
        return markedJobs.slice(0, limit);
      }
    }

    // If no keyword hits, try AI-expanded keywords to broaden real-job search
    const expandedKeywords = await this.expandKeywords(keywords);
    const expandedResults: JobListing[] = [];
    for (const kw of expandedKeywords) {
      const extra = await RealJobProvider.searchJobs({
        keywords: kw,
        zipCode,
        radiusMiles: willingToRelocate ? 100 : radiusMiles,
        limit
      });
      expandedResults.push(...extra);
      if (expandedResults.length >= limit) break;
    }

    if (expandedResults.length > 0) {
      // console.log(`🟢 Using real jobs for expanded search "${keywords}" -> [${expandedKeywords.join(', ')}] in ${zipCode}: ${expandedResults.length} found`);
      const markedJobs = expandedResults.map(job => ({
        ...job,
        requiresRelocation: willingToRelocate && (job.distanceFromStudent || 0) > radiusMiles,
        originalSearchRadius: radiusMiles
      }));
      return this.dedup(markedJobs).slice(0, limit);
    }

    // If still empty, try inferring careers and searching those (may still hit real jobs inside getJobListings)
    const relevantCareers = this.findRelevantCareers(keywords);
    const allJobs: JobListing[] = [];

    for (const career of relevantCareers) {
      const jobs = await this.getJobListings(career, zipCode, radiusMiles, 5, willingToRelocate);
      allJobs.push(...jobs);
    }

    if (allJobs.length > 0) {
      // console.log(`🟠 Using fallback/mock jobs for search "${keywords}" in ${zipCode}: ${allJobs.length} found`);
    } else {
      // console.log(`🔴 No jobs found for search "${keywords}" in ${zipCode} (real provider unreachable or empty)`);
    }

    return allJobs
      .filter(job => 
        job.title.toLowerCase().includes(keywords.toLowerCase()) ||
        job.description.toLowerCase().includes(keywords.toLowerCase())
      )
      .slice(0, limit);
  }

  /**
   * Use AI to expand the keyword space (returns real-job results via provider)
   */
  private static async expandKeywords(base: string): Promise<string[]> {
    const useRealAI = process.env.USE_REAL_AI === 'true';
    const apiKey = process.env.OPENAI_API_KEY;
    if (!useRealAI || !apiKey || !base) return [];

    try {
      const client = new OpenAI({ apiKey });
      const prompt = `You are a jobs search assistant. Given a user search phrase, return 5 concise, distinct related search phrases that could find more jobs (titles, skills, or industries), separated by commas. Do NOT include explanations.\nUser phrase: "${base}"\nRelated phrases:`;

      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 60,
        temperature: 0.6
      });

      const text = resp.choices[0]?.message?.content || '';
      return text
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .filter((kw, idx, arr) => arr.indexOf(kw) === idx);
    } catch (err) {
      // console.error('AI keyword expansion failed, continuing without it:', err);
      return [];
    }
  }

  /**
   * Deduplicate job listings by applicationUrl/id/title/company combo
   */
  private static dedup(jobs: JobListing[]): JobListing[] {
    const seen = new Set<string>();
    const out: JobListing[] = [];
    for (const job of jobs) {
      const key = (job.applicationUrl || job.id || '') + '|' + job.title + '|' + job.company;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(job);
    }
    return out;
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
