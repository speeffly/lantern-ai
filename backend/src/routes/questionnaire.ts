import express from 'express';
import { QuestionnaireService } from '../services/questionnaireService';
import { RecommendationEngine } from '../services/recommendationEngine';
import { ApiResponse } from '../types';

const router = express.Router();

// GET /api/questionnaire - Get the complete questionnaire structure
router.get('/', (req, res) => {
  try {
    const questionnaire = QuestionnaireService.getQuestionnaire();
    
    res.json({
      success: true,
      data: questionnaire,
      message: 'Questionnaire structure retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error getting questionnaire:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve questionnaire'
    } as ApiResponse);
  }
});

// GET /api/questionnaire/question/:questionId - Get a specific question
router.get('/question/:questionId', (req, res) => {
  try {
    const { questionId } = req.params;
    const question = QuestionnaireService.getQuestion(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: question,
      message: 'Question retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error getting question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve question'
    } as ApiResponse);
  }
});

// POST /api/questionnaire/validate - Validate questionnaire responses
router.post('/validate', (req, res) => {
  try {
    const responses = req.body;
    const validation = QuestionnaireService.validateResponses(responses);
    
    res.json({
      success: true,
      data: validation,
      message: 'Validation completed'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error validating responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate responses'
    } as ApiResponse);
  }
});

// POST /api/questionnaire/progress - Get completion progress
router.post('/progress', (req, res) => {
  try {
    const responses = req.body;
    const progress = QuestionnaireService.getProgress(responses);
    
    res.json({
      success: true,
      data: progress,
      message: 'Progress calculated successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error calculating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate progress'
    } as ApiResponse);
  }
});

// POST /api/questionnaire/next-question - Get next incomplete question
router.post('/next-question', (req, res) => {
  try {
    const responses = req.body;
    const nextQuestion = QuestionnaireService.getNextIncompleteQuestion(responses);
    
    res.json({
      success: true,
      data: nextQuestion,
      message: nextQuestion ? 'Next question found' : 'All required questions complete'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error finding next question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find next question'
    } as ApiResponse);
  }
});

// POST /api/questionnaire/summary - Generate response summary
router.post('/summary', (req, res) => {
  try {
    const responses = req.body;
    const summary = QuestionnaireService.generateSummary(responses);
    
    res.json({
      success: true,
      data: summary,
      message: 'Summary generated successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary'
    } as ApiResponse);
  }
});

// POST /api/questionnaire/submit - Submit questionnaire and get recommendations
router.post('/submit', async (req, res) => {
  try {
    const responses = req.body;
    
    console.log('📝 Received questionnaire submission');
    
    // Validate responses
    const validation = QuestionnaireService.validateResponses(responses);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Questionnaire validation failed',
        details: validation.errors
      } as ApiResponse);
    }
    
    // Convert to StudentProfile format
    const studentProfile = QuestionnaireService.convertToStudentProfile(responses);
    
    console.log('🔄 Converting questionnaire to student profile');
    console.log('📊 Profile summary:', {
      grade: studentProfile.grade,
      workEnvironment: studentProfile.workEnvironment.length,
      workStyle: studentProfile.workStyle.length,
      academicInterests: studentProfile.academicInterests.length,
      traits: studentProfile.traits.length,
      educationWillingness: studentProfile.educationWillingness
    });
    
    // Generate recommendations using the recommendation engine
    const recommendations = RecommendationEngine.generateRecommendations(studentProfile);
    
    console.log('✅ Recommendations generated from questionnaire');
    console.log('📈 Results:', {
      topCluster: recommendations.top_clusters[0]?.name,
      bestFitCount: recommendations.career_recommendations.best_fit.length,
      goodFitCount: recommendations.career_recommendations.good_fit.length,
      stretchCount: recommendations.career_recommendations.stretch_options.length
    });
    
    // Include validation warnings in response
    const responseData = {
      recommendations,
      validation: {
        warnings: validation.warnings
      },
      studentProfile: {
        grade: studentProfile.grade,
        zipCode: studentProfile.zipCode,
        readinessLevel: recommendations.student_profile_summary.readiness_level,
        keyStrengths: recommendations.student_profile_summary.key_strengths,
        primaryInterests: recommendations.student_profile_summary.primary_interests
      }
    };
    
    res.json({
      success: true,
      data: responseData,
      message: 'Questionnaire submitted and recommendations generated successfully'
    } as ApiResponse);
    
  } catch (error) {
    console.error('❌ Error processing questionnaire submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process questionnaire submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

export default router;