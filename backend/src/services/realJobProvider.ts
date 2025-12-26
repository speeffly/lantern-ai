import https from 'https';
import { URL } from 'url';
import { JobListing } from './jobListingService';

interface AdzunaResponse {
  results?: Array<{
    id?: string;
    title?: string;
    company?: { display_name?: string };
    location?: { display_name?: string };
    created?: string;
    redirect_url?: string;
    description?: string;
    category?: { label?: string };
    salary_min?: number;
    salary_max?: number;
  }>;
}

/**
 * Fetch real job listings from Adzuna when enabled via environment variables.
 * Falls back to caller-provided mocks when disabled or if the API fails.
 */
export class RealJobProvider {
  private static get appId() {
    return (process.env.ADZUNA_APP_ID || '').trim();
  }
  private static get apiKey() {
    return (process.env.ADZUNA_API_KEY || '').trim();
  }
  private static get country() {
    return (process.env.ADZUNA_COUNTRY || 'us').trim();
  }

  static isEnabled(): boolean {
    const flag = (process.env.USE_REAL_JOBS || '').toLowerCase().trim();
    const on = (flag === 'true' || flag === '1' || flag === 'yes') && !!(this.appId && this.apiKey);
    if (!on) {
      console.log('🟠 RealJobProvider disabled: set USE_REAL_JOBS=true and provide ADZUNA_APP_ID/ADZUNA_API_KEY');
    }
    return on;
  }

  /**
   * Search jobs by keywords/career and location.
   */
  static async searchJobs(
    options: {
      keywords?: string;
      careerTitle?: string;
      zipCode: string;
      radiusMiles: number;
      limit: number;
    }
  ): Promise<JobListing[]> {
    if (!this.isEnabled()) return [];

    const { keywords, careerTitle, zipCode, radiusMiles, limit } = options;
    const query = [careerTitle, keywords].filter(Boolean).join(' ').trim();

    if (!query) return [];

    try {
      const pagesToFetch = Math.ceil(limit / 25);
      const collected: JobListing[] = [];

      for (let page = 1; page <= pagesToFetch; page++) {
        const url = new URL(`https://api.adzuna.com/v1/api/jobs/${this.country}/search/${page}`);
        url.searchParams.set('app_id', this.appId as string);
        url.searchParams.set('app_key', this.apiKey as string);
        url.searchParams.set('results_per_page', Math.min(50, limit).toString());
        url.searchParams.set('what', query);
        url.searchParams.set('where', zipCode);
        url.searchParams.set('distance', radiusMiles.toString());
        url.searchParams.set('content-type', 'application/json');

        const json = await this.fetchJson<AdzunaResponse>(url.toString());
        if (!json.results || json.results.length === 0) continue;

        const mapped = json.results
          .filter(job => !!job.redirect_url) // ensure we have a real link
          .map((job, index) => ({
            id: job.id || `adzuna_${Date.now()}_${page}_${index}`,
            title: job.title || 'Job Opportunity',
            company: job.company?.display_name || 'Employer',
            location: job.location?.display_name || `Near ${zipCode}`,
            salary: this.formatSalary(job.salary_min, job.salary_max),
            description: job.description || 'See job description at source.',
            requirements: [],
            postedDate: job.created || new Date().toISOString().split('T')[0],
            applicationUrl: job.redirect_url as string,
            source: 'local',
            experienceLevel: 'entry',
            educationRequired: 'Not specified',
            distanceFromStudent: undefined
          } as JobListing));

        collected.push(...mapped);

        if (collected.length >= limit) break;
      }

      return collected.slice(0, limit);
    } catch (error) {
      console.error('❌ RealJobProvider failed, falling back to mocks:', error);
      return [];
    }
  }

  private static formatSalary(min?: number, max?: number): string | undefined {
    if (min && max) return `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
    if (min) return `$${Math.round(min).toLocaleString()}+`;
    if (max) return `Up to $${Math.round(max).toLocaleString()}`;
    return undefined;
  }

  private static fetchJson<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const req = https.get(url, res => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }

        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(8000, () => {
        req.destroy(new Error('Request timeout'));
      });
    });
  }
}
