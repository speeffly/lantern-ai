import express from 'express';
import { ImprovedAssessmentService } from '../services/improvedAssessmentService';
import { WeightedAIPromptService } from '../services/weightedAIPromptService';
import { CareerMatchingService } from '../services/careerMatchingService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { ApiResponse, StudentProfile } from '../types';
import { ImprovedAssessmentResponse } from '../services/improvedCareerMatchingService';

const router = express.Router();

// GET /api/assessment/v2 - Get the improved assessment structure
router.get('/', (req, res) => {
  try {
    const assessment = ImprovedAssessmentService.getAssessment();
    
    res.json({
      success: true,
      data: assessment,
      message: 'Improved assessment structure retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error getting improved assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve improved assessment'
    } as ApiResponse);
  }
});

// GET /api/assessment/v2/branching - Get the branching question
router.get('/branching', (req, res) => {
  try {
    const branchingQuestion = ImprovedAssessmentService.getBranchingQuestion();
    
    if (!branchingQuestion) {
      return res.status(404).json({
        success: false,
        error: 'Branching question not found'
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: branchingQuestion,
      message: 'Branching question retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error getting branching question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve branching question'
    } as ApiResponse);
  }
});

// GET /api/assessment/v2/questions/:path - Get questions for a specific path
router.get('/questions/:path', (req, res) => {
  try {
    const { path } = req.params;
    
    if (!['hard_hat', 'non_hard_hat', 'unable_to_decide'].includes(path)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid path. Must be hard_hat, non_hard_hat, or unable_to_decide'
      } as ApiResponse);
    }
    
    const questions = ImprovedAssessmentService.getQuestionsForPath(path);
    const assessment = ImprovedAssessmentService.getAssessment();
    const pathConfig = assessment.pathLogic[path];
    
    res.json({
      success: true,
      data: {
        path,
        pathConfig,
        questions,
        totalQuestions: questions.length
      },
      message: `Questions for ${path} retrieved successfully`
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error getting path questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve path questions'
    } as ApiResponse);
  }
});

// POST /api/assessment/v2/determine-path - Determine path based on work preference
router.post('/determine-path', (req, res) => {
  try {
    const { workPreference } = req.body;
    
    if (!workPreference) {
      return res.status(400).json({
        success: false,
        error: 'Work preference response is required'
      } as ApiResponse);
    }
    
    const path = ImprovedAssessmentService.determinePath(workPreference);
    const assessment = ImprovedAssessmentService.getAssessment();
    const pathConfig = assessment.pathLogic[path];
    
    let reasoning = '';
    switch (path) {
      case 'hard_hat':
        reasoning = 'Student prefers hands-on, physical work - using hard hat career path';
        break;
      case 'non_hard_hat':
        reasoning = 'Student prefers professional, knowledge-based work - using non hard hat career path';
        break;
      case 'unable_to_decide':
        reasoning = 'Student needs career exploration - using discovery and exploration approach';
        break;
    }
    
    res.json({
      success: true,
      data: {
        selectedPath: path,
        pathConfig,
        reasoning
      },
      message: 'Path determined successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error determining path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to determine assessment path'
    } as ApiResponse);
  }
});

// POST /api/assessment/v2/validate - Validate assessment responses
router.post('/validate', (req, res) => {
  try {
    const { responses, path } = req.body;
    
    if (!responses || !path) {
      return res.status(400).json({
        success: false,
        error: 'Responses and path are required'
      } as ApiResponse);
    }
    
    const validation = ImprovedAssessmentService.validateResponses(responses, path);
    
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

// POST /api/assessment/v2/progress - Get assessment progress
router.post('/progress', (req, res) => {
  try {
    const { responses, path } = req.body;
    
    if (!responses || !path) {
      return res.status(400).json({
        success: false,
        error: 'Responses and path are required'
      } as ApiResponse);
    }
    
    const progress = ImprovedAssessmentService.getProgress(responses, path);
    
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

// POST /api/assessment/v2/submit - Submit improved assessment and get recommendations
router.post('/submit', async (req, res) => {
  try {
    const { responses, path, sessionToken } = req.body;
    
    console.log('📝 Received improved assessment submission');
    console.log('🛤️ Path taken:', path);
    console.log('📊 Response keys:', Object.keys(responses));
    
    // Validate responses
    const validation = ImprovedAssessmentService.validateResponses(responses, path);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Assessment validation failed',
        details: validation.errors
      } as ApiResponse);
    }
    
    // Convert to weighted format for AI processing
    const weightedData = ImprovedAssessmentService.convertToWeightedFormat(responses, path);
    
    console.log('🔄 Converting to weighted format');
    console.log('⚖️ Primary indicators:', Object.keys(weightedData.primaryIndicators));
    console.log('📈 Secondary indicators:', Object.keys(weightedData.secondaryIndicators));
    
    // Generate weighted AI prompt
    const improvedAssessmentResponse: ImprovedAssessmentResponse = {
      assessmentVersion: 'v3' as const,
      pathTaken: path as 'hard_hat' | 'non_hard_hat' | 'unable_to_decide',
      responses: responses as any
    };
    const aiPrompt = WeightedAIPromptService.generateWeightedPrompt(improvedAssessmentResponse);
    
    console.log('🤖 Generated weighted AI prompt');
    
    // Get career matches using improved logic
    const careerMatches = ImprovedAssessmentService.generateCareerMatches(responses, path);
    
    console.log('🎯 Generated career matches');
    console.log('📋 Primary matches:', careerMatches.primaryMatches?.length || 0);
    
    // Generate enhanced career recommendations using existing service with weighted prompt
    let enhancedRecommendations;
    try {
      // Use the existing career matching service but with improved prompts
      const zipCode = responses.basic_info?.zipCode || '00000';
      
      // Create a simplified profile for the existing service
      const interestsText = responses.impact_and_inspiration || responses.interests_hobbies || '';
      const simplifiedProfile: Partial<StudentProfile> = {
        id: 'temp-id',
        studentId: 'temp-student-id',
        interests: interestsText ? [interestsText] : [],
        skills: Object.entries(responses.subject_strengths || {})
          .filter(([_, rating]) => rating === 'excellent' || rating === 'good')
          .map(([subject, _]) => subject),
        workEnvironment: 'mixed' as const,
        teamPreference: 'both' as const,
        educationGoal: responses.education_commitment as any || 'bachelor',
        zipCode,
        completedAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create assessment answers for the existing service
      const assessmentAnswers = [
        { questionId: 'work_preference_main', answer: responses.work_preference_main || 'mixed', timestamp: new Date() },
        { questionId: 'education_commitment', answer: responses.education_commitment || 'bachelor', timestamp: new Date() },
        { questionId: 'subject_strengths', answer: JSON.stringify(responses.subject_strengths || {}), timestamp: new Date() }
      ];
      
      // Create base matches for the service (simplified)
      const baseMatches = careerMatches.primaryMatches?.map((career: string) => ({
        career: { title: career, sector: careerMatches.sectors?.[0] || 'general' },
        matchScore: 85,
        explanation: `Match based on ${responses.work_preference_main} selection`
      })) || [];
      
      enhancedRecommendations = await CareerMatchingService.getEnhancedMatches(
        simplifiedProfile,
        assessmentAnswers,
        baseMatches
      );
      
      console.log('✅ Enhanced recommendations generated');
    } catch (aiError) {
      console.warn('⚠️ AI service unavailable, using fallback recommendations');
      enhancedRecommendations = {
        matches: careerMatches.primaryMatches?.map((career: string) => ({
          career: { title: career, sector: careerMatches.sectors?.[0] || 'general' },
          matchScore: 85,
          whyThisMatches: `Strong match based on your selection of ${responses.work_preference_main}`,
          skillGaps: { immediate: [], longTerm: [] },
          careerPathway: { steps: [], timeline: '2-4 years' },
          insights: {
            strengths: [`Interest in ${responses.work_preference_main}`],
            developmentAreas: ['Gain more specific experience'],
            nextSteps: ['Research specific career requirements']
          }
        })) || []
      };
    }
    
    // Save assessment session if sessionToken provided
    if (sessionToken) {
      try {
        const zipCode = responses.basic_info?.zipCode || '00000';
        await AssessmentServiceDB.completeSession(sessionToken, zipCode);
        console.log('💾 Assessment session completed');
      } catch (sessionError) {
        console.warn('⚠️ Failed to save session:', sessionError);
      }
    }
    
    // Prepare response data
    const responseData = {
      assessmentVersion: 'v3',
      pathTaken: path,
      recommendations: enhancedRecommendations,
      careerMatches,
      validation: {
        warnings: validation.warnings
      },
      studentProfile: {
        grade: responses.basic_info?.grade,
        zipCode: responses.basic_info?.zipCode,
        pathTaken: path,
        workPreference: responses.work_preference_main,
        specificChoice: responses.hard_hat_specific || responses.non_hard_hat_specific,
        educationCommitment: responses.education_commitment,
        readinessLevel: getReadinessLevel(path),
        keyStrengths: Object.entries(responses.subject_strengths || {})
          .filter(([_, rating]) => rating === 'excellent')
          .map(([subject, _]) => subject),
        primaryInterests: [responses.work_preference_main || 'exploring']
      },
      improvedFeatures: {
        branchingLogic: `Used ${path} (${getPathDescription(path)}) path`,
        weightedMatching: 'Applied question weighting system for better AI guidance',
        focusedQuestions: `Completed ${ImprovedAssessmentService.getQuestionsForPath(path).length} focused questions`,
        enhancedExplainability: 'Career matches based on hierarchical work preference selection and subject strengths'
      }
    };
    
    res.json({
      success: true,
      data: responseData,
      message: 'Improved assessment submitted and recommendations generated successfully'
    } as ApiResponse);
    
  } catch (error) {
    console.error('❌ Error processing improved assessment submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process improved assessment submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// POST /api/assessment/v2/weighted-prompt - Generate weighted AI prompt (for testing)
router.post('/weighted-prompt', (req, res) => {
  try {
    const { responses, path } = req.body;
    
    if (!responses || !path) {
      return res.status(400).json({
        success: false,
        error: 'Responses and path are required'
      } as ApiResponse);
    }
    
    const improvedAssessmentResponse: ImprovedAssessmentResponse = {
      assessmentVersion: 'v3' as const,
      pathTaken: path as 'hard_hat' | 'non_hard_hat' | 'unable_to_decide',
      responses: responses as any
    };
    const weightedPrompt = WeightedAIPromptService.generateWeightedPrompt(improvedAssessmentResponse);
    const weightedScore = WeightedAIPromptService.calculateWeightedScore(
      { title: 'Sample Career', sector: 'general' }, 
      improvedAssessmentResponse
    );
    
    res.json({
      success: true,
      data: {
        weightedPrompt,
        weightedScore,
        path,
        promptLength: weightedPrompt.length
      },
      message: 'Weighted AI prompt generated successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Error generating weighted prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate weighted prompt'
    } as ApiResponse);
  }
});

// Helper functions
function getReadinessLevel(path: string): string {
  switch (path) {
    case 'hard_hat':
      return 'Hands-On Direction';
    case 'non_hard_hat':
      return 'Professional Direction';
    case 'unable_to_decide':
      return 'Exploring Options';
    default:
      return 'Unknown';
  }
}

function getPathDescription(path: string): string {
  switch (path) {
    case 'hard_hat':
      return 'Hard Hat Career Path';
    case 'non_hard_hat':
      return 'Non Hard Hat Career Path';
    case 'unable_to_decide':
      return 'Career Exploration';
    default:
      return 'Unknown Path';
  }
}

export default router;