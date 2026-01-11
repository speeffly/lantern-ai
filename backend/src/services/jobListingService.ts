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
      // Prefer real jobs when enabled and available
      const realJobs = await RealJobProvider.searchJobs({
        careerTitle,
        zipCode,
        radiusMiles,
        limit
      });

      if (realJobs.length > 0) {
        // console.log(`🟢 Using real jobs for career "${careerTitle}" in ${zipCode}: ${realJobs.length} found`);
        return realJobs.slice(0, limit);
      }

      // Otherwise, return mock data that looks realistic
      // console.log(`🟠 Falling back to mock jobs for career "${careerTitle}" in ${zipCode}`);
      const mockJobs = this.generateMockJobs(careerTitle, zipCode);
      return mockJobs
        .filter(job => (job.distanceFromStudent || 0) <= radiusMiles)
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

    // If no keyword hits, try AI-expanded keywords to broaden real-job search
    const expandedKeywords = await this.expandKeywords(keywords);
    const expandedResults: JobListing[] = [];
    for (const kw of expandedKeywords) {
      const extra = await RealJobProvider.searchJobs({
        keywords: kw,
        zipCode,
        radiusMiles,
        limit
      });
      expandedResults.push(...extra);
      if (expandedResults.length >= limit) break;
    }

    if (expandedResults.length > 0) {
      // console.log(`🟢 Using real jobs for expanded search "${keywords}" -> [${expandedKeywords.join(', ')}] in ${zipCode}: ${expandedResults.length} found`);
      return this.dedup(expandedResults).slice(0, limit);
    }

    // If still empty, try inferring careers and searching those (may still hit real jobs inside getJobListings)
    const relevantCareers = this.findRelevantCareers(keywords);
    const allJobs: JobListing[] = [];

    for (const career of relevantCareers) {
      const jobs = await this.getJobListings(career, zipCode, radiusMiles, 5);
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
