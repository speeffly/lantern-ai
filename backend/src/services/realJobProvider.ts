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
    const appId = (process.env.ADZUNA_APP_ID || '').trim();
    const apiKey = (process.env.ADZUNA_API_KEY || '').trim(); // Fixed: was ADZUNA_APP_KEY
    
    const flagCheck = (flag === 'true' || flag === '1' || flag === 'yes');
    const credentialsCheck = !!(appId && apiKey);
    const isEnabled = flagCheck && credentialsCheck;
    
    if (!isEnabled) {
      // console.log('🟠 RealJobProvider disabled: set USE_REAL_JOBS=true and provide ADZUNA_APP_ID/ADZUNA_API_KEY');
      // console.log(`   - USE_REAL_JOBS: "${flag}" (needs: "true", "1", or "yes")`);
      // console.log(`   - ADZUNA_APP_ID: ${appId ? 'present' : 'missing'} (length: ${appId.length})`);
      // console.log(`   - ADZUNA_API_KEY: ${apiKey ? 'present' : 'missing'} (length: ${apiKey.length})`);
    } else {
      // console.log('✅ RealJobProvider enabled with valid credentials');
    }
    
    return isEnabled;
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

    if (!query) {
      // console.log('⚠️ No search query provided, skipping job search');
      return [];
    }

    try {
      // console.log(`🔍 Searching Adzuna for "${query}" near ${zipCode} (${radiusMiles} miles, limit: ${limit})`);
      
      // Start with page 1, limit results per page to avoid rate limiting
      const resultsPerPage = Math.min(20, limit); // Reduced from 50 to avoid issues
      const url = new URL(`https://api.adzuna.com/v1/api/jobs/${this.country}/search/1`);
      
      // Set required parameters
      url.searchParams.set('app_id', this.appId);
      url.searchParams.set('app_key', this.apiKey);
      url.searchParams.set('results_per_page', resultsPerPage.toString());
      url.searchParams.set('what', query);
      url.searchParams.set('where', zipCode);
      
      // Optional parameters - only add if they have reasonable values
      if (radiusMiles > 0 && radiusMiles <= 100) {
        url.searchParams.set('distance', radiusMiles.toString());
      }
      
      // console.log(`📡 API URL: ${url.toString().replace(this.apiKey, 'HIDDEN')}`);

      const json = await this.fetchJson<AdzunaResponse>(url.toString());
      
      if (!json.results || json.results.length === 0) {
        // console.log('⚠️ No jobs found from Adzuna API');
        return [];
      }

      // console.log(`✅ Found ${json.results.length} jobs from Adzuna`);

      const mapped = json.results
        .filter(job => !!job.title && !!job.company?.display_name) // Basic validation
        .slice(0, limit) // Ensure we don't exceed the requested limit
        .map((job, index) => ({
          id: job.id || `adzuna_${Date.now()}_${index}`,
          title: job.title || 'Job Opportunity',
          company: job.company?.display_name || 'Employer',
          location: job.location?.display_name || `Near ${zipCode}`,
          salary: this.formatSalary(job.salary_min, job.salary_max),
          description: job.description || 'See job description at source.',
          requirements: [],
          postedDate: job.created || new Date().toISOString().split('T')[0],
          applicationUrl: job.redirect_url || '',
          source: 'local',
          experienceLevel: 'entry',
          educationRequired: 'Not specified',
          distanceFromStudent: undefined
        } as JobListing));

      // console.log(`📋 Mapped ${mapped.length} valid job listings`);
      return mapped;

    } catch (error) {
      // console.error('❌ RealJobProvider failed, falling back to mocks:', error);
      
      // Log specific error details for debugging
      if (error instanceof Error) {
        if (error.message.includes('HTTP 400')) {
          // console.error('   → HTTP 400: Bad Request - Check API parameters');
          // console.error(`   → Query: "${query}", Location: "${zipCode}", Distance: ${radiusMiles}`);
        } else if (error.message.includes('HTTP 429')) {
          // console.error('   → HTTP 429: Rate Limited - Too many requests');
          // console.error('   → Consider implementing request throttling');
        } else if (error.message.includes('HTTP 401')) {
          // console.error('   → HTTP 401: Unauthorized - Check API credentials');
        } else if (error.message.includes('HTTP 403')) {
          // console.error('   → HTTP 403: Forbidden - API access denied');
        }
      }
      
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
        let data = '';
        
        // Handle different HTTP status codes
        if (res.statusCode && res.statusCode >= 400) {
          // console.error(`❌ Adzuna API returned HTTP ${res.statusCode}`);
          
          // Collect error response body for debugging
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            // console.error(`   → Error response: ${data.substring(0, 200)}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          });
          return;
        }

        // Collect successful response
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (err) {
            // console.error('❌ Failed to parse Adzuna API response:', err);
            // console.error('   → Response preview:', data.substring(0, 200));
            reject(err);
          }
        });
      });

      req.on('error', (err) => {
        // console.error('❌ Network error calling Adzuna API:', err);
        reject(err);
      });
      
      req.setTimeout(10000, () => {
        // console.error('❌ Adzuna API request timeout (10s)');
        req.destroy(new Error('Request timeout'));
      });
    });
  }
}
