import { CareerMatch, StudentProfile, AssessmentAnswer } from '../types';
import { DynamicSalaryService, LocalSalaryData } from './dynamicSalaryService';
import { CareerMatchingService } from './careerMatchingService';

/**
 * Enhanced career service that integrates dynamic salary data from real job market
 */
export class EnhancedCareerService {
  /**
   * Get career matches with dynamic salary data from real job market
   */
  static async getCareerMatchesWithDynamicSalaries(
    profile: Partial<StudentProfile>,
    answers: AssessmentAnswer[],
    zipCode: string
  ): Promise<{
    careerMatches: CareerMatch[];
    salaryData: LocalSalaryData;
    insights: {
      dynamicDataAvailable: boolean;
      jobsAnalyzed: number;
      averageSalaryDifference: number;
      recommendationQuality: 'excellent' | 'good' | 'basic';
    };
  }> {
    try {
      console.log('🎯 Getting enhanced career matches with dynamic salary data...');

      // Step 1: Get initial career matches
      const initialMatches = await CareerMatchingService.getMatches(profile, answers);
      console.log(`📊 Found ${initialMatches.length} initial career matches`);

      // Step 2: Get dynamic salary data for the area
      const salaryData = await DynamicSalaryService.getLocalSalaryData(
        zipCode,
        initialMatches,
        25 // 25 mile radius
      );

      // Step 3: Update career matches with dynamic salary data
      const enhancedMatches = this.updateMatchesWithDynamicSalaries(initialMatches, salaryData);

      // Step 4: Calculate insights
      const insights = this.calculateInsights(initialMatches, enhancedMatches, salaryData);

      console.log(`✅ Enhanced career analysis complete for ${zipCode}`);
      console.log(`   - ${insights.jobsAnalyzed} jobs analyzed`);
      console.log(`   - ${insights.dynamicDataAvailable ? 'Dynamic' : 'Static'} salary data used`);
      console.log(`   - Recommendation quality: ${insights.recommendationQuality}`);

      return {
        careerMatches: enhancedMatches,
        salaryData,
        insights
      };

    } catch (error) {
      console.error('❌ Enhanced career analysis failed:', error);
      
      // Fallback to basic career matches
      const basicMatches = await CareerMatchingService.getMatches(profile, answers);
      const fallbackSalaryData = await DynamicSalaryService.getLocalSalaryData(zipCode, basicMatches, 25);
      
      return {
        careerMatches: basicMatches,
        salaryData: fallbackSalaryData,
        insights: {
          dynamicDataAvailable: false,
          jobsAnalyzed: 0,
          averageSalaryDifference: 0,
          recommendationQuality: 'basic'
        }
      };
    }
  }

  /**
   * Update career matches with dynamic salary data
   */
  private static updateMatchesWithDynamicSalaries(
    careerMatches: CareerMatch[],
    salaryData: LocalSalaryData
  ): CareerMatch[] {
    return careerMatches.map(match => {
      // Find corresponding salary analysis
      const salaryAnalysis = salaryData.salaryAnalyses.find(
        analysis => analysis.careerTitle === match.career.title
      );

      if (salaryAnalysis && salaryAnalysis.dataSource === 'adzuna') {
        // Update with dynamic salary data
        return DynamicSalaryService.updateCareerMatchWithDynamicSalary(match, salaryAnalysis);
      }

      // Return original match if no dynamic data available
      return match;
    });
  }

  /**
   * Calculate insights about the salary analysis
   */
  private static calculateInsights(
    originalMatches: CareerMatch[],
    enhancedMatches: CareerMatch[],
    salaryData: LocalSalaryData
  ) {
    const dynamicAnalyses = salaryData.salaryAnalyses.filter(a => a.dataSource === 'adzuna');
    const totalJobs = salaryData.salaryAnalyses.reduce((sum, a) => sum + a.jobCount, 0);
    
    // Calculate average salary difference between static and dynamic data
    let totalDifference = 0;
    let comparisons = 0;
    
    enhancedMatches.forEach((enhanced, index) => {
      const original = originalMatches[index];
      if (enhanced.localSalaryData?.source === 'adzuna') {
        const difference = enhanced.career.averageSalary - original.career.averageSalary;
        totalDifference += Math.abs(difference);
        comparisons++;
      }
    });

    const averageSalaryDifference = comparisons > 0 ? Math.round(totalDifference / comparisons) : 0;

    // Determine recommendation quality
    let recommendationQuality: 'excellent' | 'good' | 'basic';
    if (dynamicAnalyses.length >= 3 && totalJobs >= 15) {
      recommendationQuality = 'excellent';
    } else if (dynamicAnalyses.length >= 2 && totalJobs >= 8) {
      recommendationQuality = 'good';
    } else {
      recommendationQuality = 'basic';
    }

    return {
      dynamicDataAvailable: dynamicAnalyses.length > 0,
      jobsAnalyzed: totalJobs,
      averageSalaryDifference,
      recommendationQuality
    };
  }

  /**
   * Get salary comparison report
   */
  static generateSalaryComparisonReport(
    careerMatches: CareerMatch[],
    salaryData: LocalSalaryData,
    zipCode: string
  ): {
    summary: string;
    comparisons: Array<{
      career: string;
      staticSalary: number;
      dynamicSalary: number;
      difference: number;
      percentageDifference: number;
      jobCount: number;
      dataSource: string;
    }>;
    insights: string[];
  } {
    const comparisons = careerMatches.map(match => {
      const salaryAnalysis = salaryData.salaryAnalyses.find(
        a => a.careerTitle === match.career.title
      );

      const staticSalary = match.career.averageSalary;
      const dynamicSalary = salaryAnalysis?.averageSalary || staticSalary;
      const difference = dynamicSalary - staticSalary;
      const percentageDifference = staticSalary > 0 ? Math.round((difference / staticSalary) * 100) : 0;

      return {
        career: match.career.title,
        staticSalary,
        dynamicSalary,
        difference,
        percentageDifference,
        jobCount: salaryAnalysis?.jobCount || 0,
        dataSource: salaryAnalysis?.dataSource || 'static'
      };
    });

    // Generate insights
    const insights: string[] = [];
    const dynamicComparisons = comparisons.filter(c => c.dataSource === 'adzuna');
    
    if (dynamicComparisons.length > 0) {
      const avgDifference = dynamicComparisons.reduce((sum, c) => sum + c.difference, 0) / dynamicComparisons.length;
      
      if (avgDifference > 5000) {
        insights.push(`Local salaries are ${Math.round(avgDifference).toLocaleString()} higher than national averages`);
      } else if (avgDifference < -5000) {
        insights.push(`Local salaries are ${Math.round(Math.abs(avgDifference)).toLocaleString()} lower than national averages`);
      } else {
        insights.push('Local salaries are close to national averages');
      }

      const highestPaying = comparisons.reduce((prev, current) => 
        current.dynamicSalary > prev.dynamicSalary ? current : prev
      );
      insights.push(`${highestPaying.career} offers the highest local salary at $${highestPaying.dynamicSalary.toLocaleString()}`);

      const mostJobs = comparisons.reduce((prev, current) => 
        current.jobCount > prev.jobCount ? current : prev
      );
      if (mostJobs.jobCount > 0) {
        insights.push(`${mostJobs.career} has the most job openings with ${mostJobs.jobCount} positions found`);
      }
    } else {
      insights.push('Using national salary averages - local job data not available');
    }

    const summary = dynamicComparisons.length > 0 
      ? `Analyzed ${dynamicComparisons.reduce((sum, c) => sum + c.jobCount, 0)} real job postings in the ${zipCode} area to provide accurate local salary data for ${dynamicComparisons.length} careers.`
      : `Using national salary averages for career guidance in the ${zipCode} area.`;

    return {
      summary,
      comparisons,
      insights
    };
  }
}