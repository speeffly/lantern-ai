import axios from 'axios';

export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  salary_min?: number;
  salary_max?: number;
  description: string;
  redirect_url: string;
  created: string;
  category: {
    label: string;
    tag: string;
  };
  contract_type?: string;
}

export interface AdzunaSearchParams {
  what?: string;        // Job title/keywords
  where?: string;       // Location
  distance?: number;    // Distance in miles
  salary_min?: number;  // Minimum salary
  salary_max?: number;  // Maximum salary
  full_time?: boolean;  // Full-time jobs only
  part_time?: boolean;  // Part-time jobs only
  permanent?: boolean;  // Permanent jobs only
  contract?: boolean;   // Contract jobs only
  results_per_page?: number; // Default 20, max 50
  sort_by?: 'relevance' | 'date' | 'salary';
}

export class AdzunaService {
  private static readonly BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
  private static readonly APP_ID = process.env.ADZUNA_APP_ID;
  private static readonly APP_KEY = process.env.ADZUNA_APP_KEY;
  private static readonly COUNTRY = 'us'; // United States

  /**
   * Search for jobs using Adzuna API
   */
  static async searchJobs(params: AdzunaSearchParams): Promise<{
    jobs: AdzunaJob[];
    count: number;
    mean_salary?: number;
  }> {
    try {
      if (!this.APP_ID || !this.APP_KEY) {
        throw new Error('Adzuna API credentials not configured. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables.');
      }

      console.log('🔍 Searching Adzuna jobs with params:', params);

      const searchParams = new URLSearchParams({
        app_id: this.APP_ID,
        app_key: this.APP_KEY,
        results_per_page: (params.results_per_page || 20).toString(),
        sort_by: params.sort_by || 'relevance'
      });

      // Add optional parameters
      if (params.what) searchParams.append('what', params.what);
      if (params.where) searchParams.append('where', params.where);
      if (params.distance) searchParams.append('distance', params.distance.toString());
      if (params.salary_min) searchParams.append('salary_min', params.salary_min.toString());
      if (params.salary_max) searchParams.append('salary_max', params.salary_max.toString());
      if (params.full_time) searchParams.append('full_time', '1');
      if (params.part_time) searchParams.append('part_time', '1');
      if (params.permanent) searchParams.append('permanent', '1');
      if (params.contract) searchParams.append('contract', '1');

      const url = `${this.BASE_URL}/${this.COUNTRY}/search/1?${searchParams.toString()}`;
      
      console.log('📡 Adzuna API URL:', url.replace(this.APP_KEY!, '[HIDDEN]'));

      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Lantern-AI-Career-Platform/1.0'
        }
      });

      const data = response.data;
      
      console.log('✅ Adzuna API response:', {
        count: data.count,
        jobs_returned: data.results?.length || 0,
        mean_salary: data.mean
      });

      return {
        jobs: data.results || [],
        count: data.count || 0,
        mean_salary: data.mean
      };

    } catch (error) {
      console.error('❌ Adzuna API error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Adzuna API authentication failed. Please check your APP_ID and APP_KEY.');
        } else if (error.response?.status === 429) {
          throw new Error('Adzuna API rate limit exceeded. Please try again later.');
        } else if (error.response?.status >= 500) {
          throw new Error('Adzuna API server error. Please try again later.');
        }
      }
      
      throw new Error(`Adzuna API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get job recommendations for specific career matches
   */
  static async getJobRecommendations(
    careerMatches: any[],
    location: string,
    maxJobsPerCareer: number = 3
  ): Promise<{
    career: string;
    jobs: AdzunaJob[];
  }[]> {
    const recommendations = [];

    for (const match of careerMatches.slice(0, 3)) { // Top 3 career matches
      try {
        const searchParams: AdzunaSearchParams = {
          what: match.career.title,
          where: location,
          distance: 25, // 25 mile radius
          results_per_page: maxJobsPerCareer,
          sort_by: 'relevance',
          full_time: true // Focus on full-time opportunities
        };

        const result = await this.searchJobs(searchParams);
        
        recommendations.push({
          career: match.career.title,
          jobs: result.jobs
        });

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Failed to get jobs for ${match.career.title}:`, error);
        // Continue with other careers even if one fails
        recommendations.push({
          career: match.career.title,
          jobs: []
        });
      }
    }

    return recommendations;
  }

  /**
   * Get salary insights for a specific job title and location
   */
  static async getSalaryInsights(jobTitle: string, location: string): Promise<{
    mean_salary?: number;
    job_count: number;
    salary_histogram?: any;
  }> {
    try {
      const searchParams: AdzunaSearchParams = {
        what: jobTitle,
        where: location,
        distance: 50,
        results_per_page: 1 // We just want the aggregated data
      };

      const result = await this.searchJobs(searchParams);
      
      return {
        mean_salary: result.mean_salary,
        job_count: result.count
      };

    } catch (error) {
      console.error('❌ Failed to get salary insights:', error);
      return {
        job_count: 0
      };
    }
  }

  /**
   * Get trending job categories in a location
   */
  static async getTrendingCategories(location: string): Promise<{
    category: string;
    job_count: number;
    mean_salary?: number;
  }[]> {
    try {
      // Search for general jobs to get category distribution
      const result = await this.searchJobs({
        where: location,
        distance: 25,
        results_per_page: 50,
        sort_by: 'date'
      });

      // Group jobs by category
      const categoryMap = new Map<string, {
        count: number;
        salaries: number[];
      }>();

      result.jobs.forEach(job => {
        const category = job.category?.label || 'Other';
        const existing = categoryMap.get(category) || { count: 0, salaries: [] };
        
        existing.count++;
        if (job.salary_min && job.salary_max) {
          existing.salaries.push((job.salary_min + job.salary_max) / 2);
        }
        
        categoryMap.set(category, existing);
      });

      // Convert to array and calculate mean salaries
      const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        job_count: data.count,
        mean_salary: data.salaries.length > 0 
          ? data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length 
          : undefined
      }));

      // Sort by job count
      return categories.sort((a, b) => b.job_count - a.job_count);

    } catch (error) {
      console.error('❌ Failed to get trending categories:', error);
      return [];
    }
  }

  /**
   * Format job for display in recommendations
   */
  static formatJobForRecommendation(job: AdzunaJob): {
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    url: string;
    posted: string;
    category: string;
  } {
    const salaryRange = job.salary_min && job.salary_max 
      ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
      : job.salary_min 
        ? `$${Math.round(job.salary_min / 1000)}k+`
        : 'Salary not specified';

    return {
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: salaryRange,
      description: job.description.substring(0, 200) + '...',
      url: job.redirect_url,
      posted: new Date(job.created).toLocaleDateString(),
      category: job.category?.label || 'Other'
    };
  }
}