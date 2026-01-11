import express from 'express';
import { CleanAIRecommendationService } from '../services/cleanAIRecommendationService';

const router = express.Router();

// Test endpoint for AI recommendations
router.post('/ai-recommendations', async (req, res) => {
  try {
    console.log('🧪 Test AI Recommendations endpoint called');
    
    const { profile, answers, careerMatches, zipCode, currentGrade, forceFallback } = req.body;
    
    console.log('📊 Test data received:', {
      profileInterests: profile?.interests,
      answersCount: answers?.length,
      topCareer: careerMatches?.[0]?.career?.title,
      zipCode,
      currentGrade,
      forceFallback
    });

    let recommendations;
    
    if (forceFallback) {
      console.log('🔄 Testing fallback recommendations (forced)');
      // Temporarily disable real AI for testing
      const originalUseRealAI = process.env.USE_REAL_AI;
      process.env.USE_REAL_AI = 'false';
      
      try {
        recommendations = await CleanAIRecommendationService.generateRecommendations(
          profile,
          answers,
          careerMatches,
          zipCode,
          currentGrade
        );
      } finally {
        // Restore original setting
        process.env.USE_REAL_AI = originalUseRealAI;
      }
    } else {
      console.log('🤖 Testing real AI recommendations');
      recommendations = await CleanAIRecommendationService.generateRecommendations(
        profile,
        answers,
        careerMatches,
        zipCode,
        currentGrade
      );
    }

    console.log('✅ Recommendations generated successfully');
    console.log('📊 Results summary:', {
      academicPlanCourses: recommendations.academicPlan?.currentYear?.length || 0,
      careerPathwaySteps: recommendations.careerPathway?.steps?.length || 0,
      skillGaps: recommendations.skillGaps?.length || 0,
      actionItems: recommendations.actionItems?.length || 0,
      localJobs: recommendations.localJobs?.length || 0
    });

    res.json({
      success: true,
      data: recommendations,
      message: 'AI recommendations generated successfully'
    });

  } catch (error) {
    console.error('❌ Test AI recommendations failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate AI recommendations'
    });
  }
});

export default router;