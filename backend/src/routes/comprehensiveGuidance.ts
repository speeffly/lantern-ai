import express from 'express';
import { AIRecommendationService } from '../services/aiRecommendationService';
import { CareerMatchingService } from '../services/careerMatchingService';
import { ParentSummaryService } from '../services/parentSummaryService';
import { AcademicPlanService } from '../services/academicPlanService';

const router = express.Router();

/**
 * Generate complete career guidance package
 * POST /api/comprehensive-guidance/complete
 */
router.post('/complete', async (req, res) => {
  try {
    const { profile, answers, careerMatches, zipCode, currentGrade } = req.body;

    if (!profile || !answers || !careerMatches || !zipCode) {
      return res.status(400).json({
        error: 'Missing required fields: profile, answers, careerMatches, zipCode'
      });
    }

    console.log('🎯 Generating complete career guidance package...');

    const guidance = await AIRecommendationService.generateComprehensiveGuidance(
      profile,
      answers,
      careerMatches,
      zipCode,
      currentGrade
    );

    res.json({
      success: true,
      data: guidance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Complete guidance generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate comprehensive career guidance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate enhanced career matches only
 * POST /api/comprehensive-guidance/career-matches
 */
router.post('/career-matches', async (req, res) => {
  try {
    const { profile, answers, careerMatches } = req.body;

    if (!profile || !answers || !careerMatches) {
      return res.status(400).json({
        error: 'Missing required fields: profile, answers, careerMatches'
      });
    }

    const enhancedMatches = await CareerMatchingService.getEnhancedMatches(
      profile,
      answers,
      careerMatches
    );

    res.json({
      success: true,
      data: { enhancedCareerMatches: enhancedMatches },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Enhanced career matches generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate enhanced career matches',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate parent summary only
 * POST /api/comprehensive-guidance/parent-summary
 */
router.post('/parent-summary', async (req, res) => {
  try {
    const { profile, answers, careerMatches, currentGrade } = req.body;

    if (!profile || !answers || !careerMatches) {
      return res.status(400).json({
        error: 'Missing required fields: profile, answers, careerMatches'
      });
    }

    const parentSummary = await ParentSummaryService.generateParentSummary(
      profile,
      answers,
      careerMatches,
      currentGrade
    );

    res.json({
      success: true,
      data: { parentSummary },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Parent summary generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate parent summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate 4-year academic plan only
 * POST /api/comprehensive-guidance/four-year-plan
 */
router.post('/four-year-plan', async (req, res) => {
  try {
    const { profile, answers, careerMatches, zipCode, currentGrade } = req.body;

    if (!profile || !answers || !careerMatches || !zipCode) {
      return res.status(400).json({
        error: 'Missing required fields: profile, answers, careerMatches, zipCode'
      });
    }

    // Generate 4-year academic plan with real job data
    const fourYearPlan = await AcademicPlanService.generateFourYearPlan(
      profile,
      answers,
      careerMatches,
      zipCode,
      currentGrade
    );

    res.json({
      success: true,
      data: { fourYearPlan },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 4-year plan generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate 4-year academic plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate counselor recommendations only (existing functionality)
 * POST /api/comprehensive-guidance/counselor-recommendations
 */
router.post('/counselor-recommendations', async (req, res) => {
  try {
    const { profile, answers, careerMatches, zipCode, currentGrade } = req.body;

    if (!profile || !answers || !careerMatches || !zipCode) {
      return res.status(400).json({
        error: 'Missing required fields: profile, answers, careerMatches, zipCode'
      });
    }

    const recommendations = await AIRecommendationService.generateRecommendations(
      profile,
      answers,
      careerMatches,
      zipCode,
      currentGrade
    );

    res.json({
      success: true,
      data: { counselorRecommendations: recommendations },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Counselor recommendations generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate counselor recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Health check endpoint
 * GET /api/comprehensive-guidance/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      careerMatching: 'available',
      parentSummary: 'available',
      fourYearPlan: 'available',
      counselorGuidance: 'available',
      adzunaIntegration: process.env.ADZUNA_APP_ID ? 'configured' : 'not configured',
      aiProvider: process.env.AI_PROVIDER || 'openai'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;