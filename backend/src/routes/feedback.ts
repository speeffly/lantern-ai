import express from 'express';
import { FeedbackService, RecommendationFeedback } from '../services/feedbackService';
import { ApiResponse } from '../types';

const router = express.Router();

// POST /api/feedback/submit - Submit feedback for a recommendation
router.post('/submit', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      recommendationId,
      careerCode,
      careerTitle,
      feedbackType,
      rating,
      isHelpful,
      comment,
      improvementSuggestions
    } = req.body;

    // Validate required fields
    if (!careerCode || !careerTitle || !feedbackType) {
      return res.status(400).json({
        success: false,
        error: 'Career code, title, and feedback type are required'
      } as ApiResponse);
    }

    // Validate feedback type
    const validFeedbackTypes = ['helpful', 'not_helpful', 'rating', 'comment'];
    if (!validFeedbackTypes.includes(feedbackType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback type'
      } as ApiResponse);
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      } as ApiResponse);
    }

    const feedback: RecommendationFeedback = {
      userId,
      sessionId,
      recommendationId,
      careerCode,
      careerTitle,
      feedbackType,
      rating,
      isHelpful,
      comment,
      improvementSuggestions
    };

    const feedbackId = await FeedbackService.submitFeedback(feedback);

    res.json({
      success: true,
      data: { feedbackId },
      message: 'Feedback submitted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    } as ApiResponse);
  }
});

// GET /api/feedback/stats - Get feedback statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await FeedbackService.getFeedbackStats();

    res.json({
      success: true,
      data: stats,
      message: 'Feedback statistics retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error retrieving feedback stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback statistics'
    } as ApiResponse);
  }
});

// GET /api/feedback/career/:careerCode - Get feedback for a specific career
router.get('/career/:careerCode', async (req, res) => {
  try {
    const { careerCode } = req.params;
    const feedback = await FeedbackService.getFeedback(careerCode);

    res.json({
      success: true,
      data: feedback,
      message: `Feedback for ${careerCode} retrieved successfully`
    } as ApiResponse);

  } catch (error) {
    console.error('Error retrieving career feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve career feedback'
    } as ApiResponse);
  }
});

// GET /api/feedback/user/:userId - Get user's feedback history
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse);
    }

    const history = await FeedbackService.getUserFeedbackHistory(userId);

    res.json({
      success: true,
      data: history,
      message: 'User feedback history retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error retrieving user feedback history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user feedback history'
    } as ApiResponse);
  }
});

// GET /api/feedback/trends - Get feedback trends
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await FeedbackService.getFeedbackTrends(days);

    res.json({
      success: true,
      data: trends,
      message: `Feedback trends for last ${days} days retrieved successfully`
    } as ApiResponse);

  } catch (error) {
    console.error('Error retrieving feedback trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback trends'
    } as ApiResponse);
  }
});

// GET /api/feedback/insights - Get AI learning insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await FeedbackService.getAILearningInsights();

    res.json({
      success: true,
      data: insights,
      message: 'AI learning insights retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Error retrieving AI insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI insights'
    } as ApiResponse);
  }
});

// GET /api/feedback/improvements/:careerCode - Get improvement suggestions for a career
router.get('/improvements/:careerCode', async (req, res) => {
  try {
    const { careerCode } = req.params;
    const improvements = await FeedbackService.getRecommendationImprovements(careerCode);

    res.json({
      success: true,
      data: improvements,
      message: `Improvement suggestions for ${careerCode} retrieved successfully`
    } as ApiResponse);

  } catch (error) {
    console.error('Error retrieving improvements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve improvement suggestions'
    } as ApiResponse);
  }
});

export default router;