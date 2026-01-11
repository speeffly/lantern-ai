import { CareerMatch } from '../types';
import { RealJobProvider } from './realJobProvider';

export interface SalaryAnalysis {
  careerTitle: string;
  averageSalary: number;
  salaryRange: {
    min: number;
    max: number;
  };
  jobCount: number;
  dataSource: 'adzuna' | 'static';
  lastUpdated: Date;
}

export interface LocalSalaryData {
  zipCode: string;
  radius: number;
  salaryAnalyses: SalaryAnalysis[];
  marketInsights: {
    highestPaying: string;
    mostJobs: string;
    averageAcrossAllCareers: number;
  };
}

/**
 * Service to calculate dynamic average salaries from real job market data
 */
export class DynamicSalaryService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static salaryCache = new Map<string, { data: LocalSalaryData; timestamp: number }>();

  /**
   * Get dynamic salary data for careers based on real job market data
   */
  static async getLocalSalaryData(
    zipCode: string,
    careerMatches: CareerMatch[],
    radiusMiles: number = 25
  ): Promise<LocalSalaryData> {
    const cacheKey = `${zipCode}-${radiusMiles}`;
    
    // Check cache first
    const cached = this.salaryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      // console.log('📊 Using cached salary data');
      return cached.data;
    }

    try {
      // console.log(`💰 Calculating dynamic salaries for ${careerMatches.length} careers near ${zipCode}`);
      
      const salaryAnalyses: SalaryAnalysis[] = [];
      
      // Analyze each career
      for (const match of careerMatches.slice(0, 5)) { // Limit to top 5 to avoid rate limiting
        try {
          const analysis = await this.analyzeCareersalary(match, zipCode, radiusMiles);
          salaryAnalyses.push(analysis);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          // console.error(`⚠️ Failed to analyze salary for ${match.career.title}:`, error);
          
          // Fallback to static data
          salaryAnalyses.push({
            careerTitle: match.career.title,
            averageSalary: match.career.averageSalary,
            salaryRange: {
              min: Math.round(match.career.averageSalary * 0.8),
              max: Math.round(match.career.averageSalary * 1.2)
            },
            jobCount: 0,
            dataSource: 'static',
            lastUpdated: new Date()
          });
        }
      }

      // Calculate market insights
      const marketInsights = this.calculateMarketInsights(salaryAnalyses);

      const localSalaryData: LocalSalaryData = {
        zipCode,
        radius: radiusMiles,
        salaryAnalyses,
        marketInsights
      };

      // Cache the results
      this.salaryCache.set(cacheKey, {
        data: localSalaryData,
        timestamp: Date.now()
      });

      // console.log(`✅ Dynamic salary analysis complete for ${zipCode}`);
      return localSalaryData;

    } catch (error) {
      // console.error('❌ Dynamic salary analysis failed:', error);
      return this.getFallbackSalaryData(zipCode, careerMatches, radiusMiles);
    }
  }

  /**
   * Analyze salary for a specific career using real job data
   */
  private static async analyzeCareersalary(
    careerMatch: CareerMatch,
    zipCode: string,
    radiusMiles: number
  ): Promise<SalaryAnalysis> {
    // console.log(`🔍 Analyzing salary for ${careerMatch.career.title}...`);

    if (!RealJobProvider.isEnabled()) {
      // console.log('⚠️ RealJobProvider disabled, using static salary data');
      return {
        careerTitle: careerMatch.career.title,
        averageSalary: careerMatch.career.averageSalary,
        salaryRange: {
          min: Math.round(careerMatch.career.averageSalary * 0.8),
          max: Math.round(careerMatch.career.averageSalary * 1.2)
        },
        jobCount: 0,
        dataSource: 'static',
        lastUpdated: new Date()
      };
    }

    try {
      // Search for jobs for this career
      const jobs = await RealJobProvider.searchJobs({
        careerTitle: careerMatch.career.title,
        zipCode: zipCode,
        radiusMiles: radiusMiles,
        limit: 20 // Get more jobs for better salary analysis
      });

      if (jobs.length === 0) {
        // console.log(`⚠️ No jobs found for ${careerMatch.career.title}, using static data`);
        return {
          careerTitle: careerMatch.career.title,
          averageSalary: careerMatch.career.averageSalary,
          salaryRange: {
            min: Math.round(careerMatch.career.averageSalary * 0.8),
            max: Math.round(careerMatch.career.averageSalary * 1.2)
          },
          jobCount: 0,
          dataSource: 'static',
          lastUpdated: new Date()
        };
      }

      // Extract salary data from jobs
      const salaryData = this.extractSalaryData(jobs);
      
      if (salaryData.length === 0) {
        // console.log(`⚠️ No salary data found in jobs for ${careerMatch.career.title}`);
        return {
          careerTitle: careerMatch.career.title,
          averageSalary: careerMatch.career.averageSalary,
          salaryRange: {
            min: Math.round(careerMatch.career.averageSalary * 0.8),
            max: Math.round(careerMatch.career.averageSalary * 1.2)
          },
          jobCount: jobs.length,
          dataSource: 'static',
          lastUpdated: new Date()
        };
      }

      // Calculate statistics
      const averageSalary = Math.round(salaryData.reduce((sum, salary) => sum + salary, 0) / salaryData.length);
      const minSalary = Math.min(...salaryData);
      const maxSalary = Math.max(...salaryData);

      // console.log(`💰 ${careerMatch.career.title}: $${averageSalary.toLocaleString()} avg (${salaryData.length} jobs with salary data)`);

      return {
        careerTitle: careerMatch.career.title,
        averageSalary,
        salaryRange: {
          min: Math.round(minSalary),
          max: Math.round(maxSalary)
        },
        jobCount: jobs.length,
        dataSource: 'adzuna',
        lastUpdated: new Date()
      };

    } catch (error) {
      // console.error(`❌ Salary analysis failed for ${careerMatch.career.title}:`, error);
      
      // Fallback to static data
      return {
        careerTitle: careerMatch.career.title,
        averageSalary: careerMatch.career.averageSalary,
        salaryRange: {
          min: Math.round(careerMatch.career.averageSalary * 0.8),
          max: Math.round(careerMatch.career.averageSalary * 1.2)
        },
        jobCount: 0,
        dataSource: 'static',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Extract salary data from job listings
   */
  private static extractSalaryData(jobs: any[]): number[] {
    const salaries: number[] = [];

    jobs.forEach(job => {
      if (job.salary && typeof job.salary === 'string') {
        // Parse salary strings like "$50,000 - $60,000", "$45,000+", "Up to $55,000"
        const salaryStr = job.salary.replace(/,/g, '');
        
        // Range format: "$50000 - $60000"
        const rangeMatch = salaryStr.match(/\$(\d+)\s*-\s*\$(\d+)/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1]);
          const max = parseInt(rangeMatch[2]);
          salaries.push((min + max) / 2);
          return;
        }

        // Plus format: "$50000+"
        const plusMatch = salaryStr.match(/\$(\d+)\+/);
        if (plusMatch) {
          salaries.push(parseInt(plusMatch[1]));
          return;
        }

        // Up to format: "Up to $55000"
        const upToMatch = salaryStr.match(/Up to \$(\d+)/);
        if (upToMatch) {
          salaries.push(parseInt(upToMatch[1]) * 0.9); // Assume 90% of max
          return;
        }

        // Single number: "$50000"
        const singleMatch = salaryStr.match(/\$(\d+)/);
        if (singleMatch) {
          salaries.push(parseInt(singleMatch[1]));
          return;
        }
      }
    });

    return salaries;
  }

  /**
   * Calculate market insights from salary analyses
   */
  private static calculateMarketInsights(analyses: SalaryAnalysis[]) {
    if (analyses.length === 0) {
      return {
        highestPaying: 'No data available',
        mostJobs: 'No data available',
        averageAcrossAllCareers: 0
      };
    }

    // Find highest paying career
    const highestPaying = analyses.reduce((prev, current) => 
      current.averageSalary > prev.averageSalary ? current : prev
    );

    // Find career with most jobs
    const mostJobs = analyses.reduce((prev, current) => 
      current.jobCount > prev.jobCount ? current : prev
    );

    // Calculate overall average
    const totalSalary = analyses.reduce((sum, analysis) => sum + analysis.averageSalary, 0);
    const averageAcrossAllCareers = Math.round(totalSalary / analyses.length);

    return {
      highestPaying: highestPaying.careerTitle,
      mostJobs: mostJobs.careerTitle,
      averageAcrossAllCareers
    };
  }

  /**
   * Get fallback salary data when dynamic analysis fails
   */
  private static getFallbackSalaryData(
    zipCode: string,
    careerMatches: CareerMatch[],
    radiusMiles: number
  ): LocalSalaryData {
    const salaryAnalyses: SalaryAnalysis[] = careerMatches.map(match => ({
      careerTitle: match.career.title,
      averageSalary: match.career.averageSalary,
      salaryRange: {
        min: Math.round(match.career.averageSalary * 0.8),
        max: Math.round(match.career.averageSalary * 1.2)
      },
      jobCount: 0,
      dataSource: 'static' as const,
      lastUpdated: new Date()
    }));

    return {
      zipCode,
      radius: radiusMiles,
      salaryAnalyses,
      marketInsights: this.calculateMarketInsights(salaryAnalyses)
    };
  }

  /**
   * Update career match with dynamic salary data
   */
  static updateCareerMatchWithDynamicSalary(
    careerMatch: CareerMatch,
    salaryAnalysis: SalaryAnalysis
  ): CareerMatch {
    return {
      ...careerMatch,
      career: {
        ...careerMatch.career,
        averageSalary: salaryAnalysis.averageSalary,
        salaryRange: salaryAnalysis.salaryRange
      },
      localSalaryData: {
        source: salaryAnalysis.dataSource,
        jobCount: salaryAnalysis.jobCount,
        lastUpdated: salaryAnalysis.lastUpdated
      }
    };
  }

  /**
   * Clear salary cache (useful for testing or manual refresh)
   */
  static clearCache(): void {
    this.salaryCache.clear();
    // console.log('🗑️ Salary cache cleared');
  }
}