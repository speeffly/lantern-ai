import express from 'express';
import { DynamicSalaryService } from '../services/dynamicSalaryService';
import { EnhancedCareerService } from '../services/enhancedCareerService';
import { CareerMatchingService } from '../services/careerMatchingService';

const router = express.Router();

/**
 * GET /api/dynamic-salary/analysis/:zipCode
 * Get dynamic salary analysis for a specific area
 */
router.get('/analysis/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    const { careers, radius = 25 } = req.query;

    console.log(`📊 Dynamic salary analysis requested for ${zipCode}`);

    // If specific careers provided, use them; otherwise get default career matches
    let careerMatches;
    if (careers && typeof careers === 'string') {
      const careerTitles = careers.split(',');
      // Create mock career matches for the requested careers
      careerMatches = careerTitles.map((title, index) => ({
        careerId: `career-${index}`,
        career: {
          id: `career-${index}`,
          title: title.trim(),
          sector: 'healthcare' as const, // Use valid Sector type
          description: `${title.trim()} professional`,
          responsibilities: ['Various duties'],
          requiredEducation: 'certificate' as const,
          certifications: [],
          averageSalary: 50000, // Default static salary
          salaryRange: { min: 40000, max: 60000 },
          growthOutlook: 'Average'
        },
        matchScore: 80,
        reasoningFactors: ['User specified'],
        localDemand: 'medium' as const,
        localSalary: { min: 40000, max: 60000, location: zipCode },
        localEmployers: ['Local employers']
      }));
    } else {
      // Get default career matches (you might want to use a default profile)
      const defaultProfile = { interests: ['General'], skills: ['Communication'] };
      const defaultAnswers = [{ questionId: 'interests', answer: 'General', timestamp: new Date() }];
      careerMatches = await CareerMatchingService.getEnhancedMatches(defaultProfile, defaultAnswers, []);
    }

    // Get dynamic salary data
    const salaryData = await DynamicSalaryService.getLocalSalaryData(
      zipCode,
      careerMatches,
      parseInt(radius as string)
    );

    // Generate comparison report
    const report = EnhancedCareerService.generateSalaryComparisonReport(
      careerMatches,
      salaryData,
      zipCode
    );

    res.json({
      success: true,
      data: {
        zipCode,
        radius: parseInt(radius as string),
        salaryData,
        report,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Dynamic salary analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze dynamic salary data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/dynamic-salary/enhanced-careers
 * Get career matches with dynamic salary data
 */
router.post('/enhanced-careers', async (req, res) => {
  try {
    const { profile, answers, zipCode } = req.body;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        error: 'ZIP code is required'
      });
    }

    console.log(`🎯 Enhanced career analysis requested for ${zipCode}`);

    // Get enhanced career matches with dynamic salary data
    const result = await EnhancedCareerService.getCareerMatchesWithDynamicSalaries(
      profile || {},
      answers || [],
      zipCode
    );

    res.json({
      success: true,
      data: {
        careerMatches: result.careerMatches,
        salaryData: result.salaryData,
        insights: result.insights,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Enhanced career analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get enhanced career matches',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/dynamic-salary/cache/clear
 * Clear the salary data cache (for testing/debugging)
 */
router.get('/cache/clear', async (req, res) => {
  try {
    DynamicSalaryService.clearCache();
    
    res.json({
      success: true,
      message: 'Salary cache cleared successfully'
    });

  } catch (error) {
    console.error('❌ Cache clear failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/dynamic-salary/test/:zipCode
 * Test endpoint to verify dynamic salary calculation
 */
router.get('/test/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    
    console.log(`🧪 Testing dynamic salary calculation for ${zipCode}`);

    // Create test career matches
    const testCareers = [
      {
        careerId: 'nurse',
        career: {
          id: 'nurse',
          title: 'Licensed Practical Nurse',
          sector: 'healthcare' as const,
          description: 'Provide basic nursing care',
          responsibilities: ['Patient care'],
          requiredEducation: 'certificate' as const,
          certifications: ['LPN License'],
          averageSalary: 50000,
          salaryRange: { min: 45000, max: 55000 },
          growthOutlook: 'Faster than average'
        },
        matchScore: 85,
        reasoningFactors: ['Healthcare interest'],
        localDemand: 'high' as const,
        localSalary: { min: 45000, max: 55000, location: zipCode },
        localEmployers: ['Local Hospital']
      },
      {
        careerId: 'welder',
        career: {
          id: 'welder',
          title: 'Welder',
          sector: 'infrastructure' as const,
          description: 'Join metal parts using welding equipment',
          responsibilities: ['Welding'],
          requiredEducation: 'certificate' as const,
          certifications: ['AWS Certification'],
          averageSalary: 47000,
          salaryRange: { min: 40000, max: 54000 },
          growthOutlook: 'Average'
        },
        matchScore: 78,
        reasoningFactors: ['Hands-on work'],
        localDemand: 'medium' as const,
        localSalary: { min: 40000, max: 54000, location: zipCode },
        localEmployers: ['Local Construction']
      }
    ];

    // Test dynamic salary calculation
    const salaryData = await DynamicSalaryService.getLocalSalaryData(zipCode, testCareers, 25);
    
    // Generate test report
    const report = EnhancedCareerService.generateSalaryComparisonReport(testCareers, salaryData, zipCode);

    res.json({
      success: true,
      test: true,
      data: {
        zipCode,
        testCareers: testCareers.length,
        salaryData,
        report,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Dynamic salary test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Dynamic salary test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;