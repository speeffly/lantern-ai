import express from 'express';
import { FinalAssessmentService } from '../services/improvedAssessmentService';
import { WeightedAIPromptService } from '../services/weightedAIPromptService';
import { CareerMatchingService } from '../services/careerMatchingService';
import { CleanAIRecommendationService } from '../services/cleanAIRecommendationService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { ApiResponse, StudentProfile } from '../types';
import { ImprovedAssessmentResponse } from '../services/improvedCareerMatchingService';

const router = express.Router();

// GET /api/assessment/v2 - Get the improved assessment structure
router.get('/', (req, res) => {
  try {
    const assessment = FinalAssessmentService.getAssessment();
    
    res.json({
      success: true,
      data: assessment,
      message: 'Improved assessment structure retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    // console.error('❌ Error getting improved assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve improved assessment'
    } as ApiResponse);
  }
});

// GET /api/assessment/v2/v1 - Get the new v1 questionnaire structure
router.get('/v1', (req, res) => {
  try {
    const questionnaire = FinalAssessmentService.getQuestionnaireV1();
    
    res.json({
      success: true,
      data: questionnaire,
      message: 'V1 questionnaire structure retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    // console.error('❌ Error getting v1 questionnaire:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve v1 questionnaire'
    } as ApiResponse);
  }
});

// GET /api/assessment/v2/branching - Get the branching question
router.get('/branching', (req, res) => {
  try {
    const branchingQuestion = FinalAssessmentService.getBranchingQuestion();
    
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
    // console.error('❌ Error getting branching question:', error);
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
    
    if (!['hard_hat', 'non_hard_hat', 'unable_to_decide', 'decided', 'undecided'].includes(path)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid path. Must be hard_hat, non_hard_hat, unable_to_decide, decided, or undecided'
      } as ApiResponse);
    }
    
    const questions = FinalAssessmentService.getQuestionsForPath(path);
    const assessment = FinalAssessmentService.getAssessment();
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
    // console.error('❌ Error getting path questions:', error);
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
    
    const path = FinalAssessmentService.determinePath(workPreference);
    const assessment = FinalAssessmentService.getAssessment();
    const pathConfig = assessment.pathLogic[path];
    
    let reasoning = '';
    switch (path) {
      case 'decided':
        if (workPreference === 'hard_hat') {
          reasoning = 'Student prefers hands-on, physical work - using decided career path';
        } else if (workPreference === 'non_hard_hat') {
          reasoning = 'Student prefers professional, knowledge-based work - using decided career path';
        } else {
          reasoning = 'Student has clear career direction - using decided career path';
        }
        break;
      case 'undecided':
        reasoning = 'Student needs career exploration - using discovery and exploration approach';
        break;
      // Legacy support
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
    // console.error('❌ Error determining path:', error);
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
    
    const validation = FinalAssessmentService.validateResponses(responses, path);
    
    res.json({
      success: true,
      data: validation,
      message: 'Validation completed'
    } as ApiResponse);
  } catch (error) {
    // console.error('❌ Error validating responses:', error);
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
    
    const progress = FinalAssessmentService.getProgress(responses, path);
    
    res.json({
      success: true,
      data: progress,
      message: 'Progress calculated successfully'
    } as ApiResponse);
  } catch (error) {
    // console.error('❌ Error calculating progress:', error);
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
    
    // Validate responses
    const validation = FinalAssessmentService.validateResponses(responses, path);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Assessment validation failed',
        details: validation.errors
      } as ApiResponse);
    }
    
    // Convert to weighted format for AI processing
    const weightedData = FinalAssessmentService.convertToWeightedFormat(responses, path);
    
    // Generate weighted AI prompt
    const improvedAssessmentResponse: ImprovedAssessmentResponse = {
      assessmentVersion: 'v3' as const,
      pathTaken: path as 'hard_hat' | 'non_hard_hat' | 'unable_to_decide' | 'decided' | 'undecided',
      responses: responses as any
    };
    const aiPrompt = WeightedAIPromptService.generateWeightedPrompt(improvedAssessmentResponse);
    
    // Get career matches using improved logic
    const careerMatches = FinalAssessmentService.generateCareerMatches(responses, path);
    
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
      
    } catch (aiError) {
      // console.warn('⚠️ AI service unavailable, using fallback recommendations');
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
      } catch (sessionError) {
        // console.warn('⚠️ Failed to save session:', sessionError);
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
        focusedQuestions: `Completed ${FinalAssessmentService.getQuestionsForPath(path).length} focused questions`,
        enhancedExplainability: 'Career matches based on hierarchical work preference selection and subject strengths'
      }
    };
    
    res.json({
      success: true,
      data: responseData,
      message: 'Improved assessment submitted and recommendations generated successfully'
    } as ApiResponse);
    
  } catch (error) {
    // console.error('❌ Error processing improved assessment submission:', error);
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
      pathTaken: path as 'hard_hat' | 'non_hard_hat' | 'unable_to_decide' | 'decided' | 'undecided',
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
    // console.error('❌ Error generating weighted prompt:', error);
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
    case 'decided':
      return 'Clear Direction';
    case 'non_hard_hat':
      return 'Professional Direction';
    case 'unable_to_decide':
    case 'undecided':
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
    case 'decided':
      return 'Decided Career Path';
    case 'unable_to_decide':
    case 'undecided':
      return 'Career Exploration';
    default:
      return 'Unknown Path';
  }
}

// POST /api/assessment/v2/submit-v1 - Submit V1 questionnaire and get comprehensive AI recommendations
router.post('/submit-v1', async (req, res) => {
  try {
    const { responses } = req.body;
    
    // Convert V1 responses to AssessmentAnswer format for AI processing
    const assessmentAnswers = convertV1ResponsesToAssessmentAnswers(responses);
    
    // Process V1 questionnaire responses for career matching
    const processedData = FinalAssessmentService.processV1QuestionnaireResponses(responses);
    
    // Create student profile from V1 responses
    const zipCode = responses.q1_grade_zip?.zipCode || '00000';
    const grade = responses.q1_grade_zip?.grade || '11';
    
    const studentProfile: Partial<StudentProfile> = {
      id: 'temp-v1-id',
      studentId: 'temp-v1-student-id',
      interests: extractInterestsFromV1(responses),
      skills: extractSkillsFromV1(responses),
      workEnvironment: 'mixed' as const,
      teamPreference: 'both' as const,
      educationGoal: mapEducationWillingness(responses.q5_education_willingness) as any,
      zipCode,
      completedAt: new Date(),
      updatedAt: new Date()
    };
    
    // Generate initial career matches based on V1 responses
    let initialCareerMatches: any[] = [];
    
    if (processedData.responses.specific_career) {
      // Direct career selection - highest priority
      const specificCareer = processedData.responses.specific_career;
      
      const mappedCareer = mapV1CareerToDatabase(specificCareer);
      
      if (mappedCareer) {
        initialCareerMatches = [
          {
            career: mappedCareer,
            matchScore: 95,
            explanation: `You specifically selected "${specificCareer}" as your career interest.`,
            reasoningFactors: [
              'Direct career selection match',
              'High confidence based on specific choice',
              `Education commitment: ${responses.q5_education_willingness || 'Not specified'}`
            ]
          }
        ];
      }
    }
    
    // Add category-based matches for broader exploration ONLY if no direct career selection
    if (processedData.responses.career_category && !processedData.responses.specific_career) {
      const categoryMatches = generateCategoryMatches(processedData.responses.career_category);
      initialCareerMatches = [...initialCareerMatches, ...categoryMatches.slice(0, 5)];
    }
    
    // If still no matches (undecided path), generate exploration matches
    if (initialCareerMatches.length === 0) {
      initialCareerMatches = generateExplorationMatches(processedData.responses);
    }
    
    // Generate comprehensive AI recommendations using the enhanced service
    let aiRecommendations;
    let enhancedCareerMatches = initialCareerMatches;
    
    try {
      // Use the clean AI recommendation service with all assessment data
      aiRecommendations = await CleanAIRecommendationService.generateRecommendations(
        studentProfile,
        assessmentAnswers, // This now contains ALL V1 questionnaire data
        initialCareerMatches,
        zipCode,
        parseInt(grade)
      );
      
    } catch (aiError) {
      // console.warn('⚠️ AI service error, using fallback recommendations:', aiError);
      
      // Generate fallback AI recommendations
      aiRecommendations = await CleanAIRecommendationService.generateRecommendations(
        studentProfile,
        assessmentAnswers,
        initialCareerMatches,
        zipCode,
        parseInt(grade)
      );
    }
    
    // Prepare comprehensive response data
    const responseData = {
      assessmentVersion: 'v1',
      pathTaken: processedData.pathTaken,
      careerMatches: enhancedCareerMatches.slice(0, 8), // Top 8 matches with AI insights
      aiRecommendations: aiRecommendations,
      determinedWorkPreference: processedData.responses.career_category,
      specificCareerChoice: processedData.responses.specific_career,
      studentProfile: {
        grade: grade,
        zipCode: zipCode,
        careerKnowledge: responses.q3_career_knowledge,
        educationWillingness: responses.q5_education_willingness,
        constraints: responses.q14_constraints,
        support: responses.q17_support_confidence,
        academicPerformance: responses.q4_academic_performance,
        traits: responses.q10_traits,
        interests: responses.q8_interests_text,
        experience: responses.q9_experience_text,
        impactInspiration: responses.q19_20_impact_inspiration
      },
      comprehensiveAnalysis: {
        totalQuestionsAnswered: Object.keys(responses).length,
        assessmentDataCaptured: assessmentAnswers.length,
        primaryFactor: processedData.responses.specific_career 
          ? `Direct career selection: ${processedData.responses.specific_career}`
          : processedData.responses.career_category
          ? `Career category: ${processedData.responses.career_category}`
          : 'Exploration based on traits and interests',
        educationAlignment: responses.q5_education_willingness,
        constraintsConsidered: responses.q14_constraints?.length > 0,
        aiProcessingStatus: aiRecommendations ? 'Success' : 'Fallback used'
      }
    };
    
    res.json({
      success: true,
      data: responseData,
      message: 'V1 questionnaire submitted and comprehensive AI recommendations generated successfully'
    } as ApiResponse);
    
  } catch (error) {
    // console.error('❌ Error processing V1 questionnaire submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process V1 questionnaire submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// Helper function to convert V1 responses to AssessmentAnswer format
function convertV1ResponsesToAssessmentAnswers(responses: { [key: string]: any }): any[] {
  const assessmentAnswers: any[] = [];
  const timestamp = new Date();
  
  // Convert each V1 response to AssessmentAnswer format
  Object.entries(responses).forEach(([questionId, answer]) => {
    assessmentAnswers.push({
      questionId,
      answer,
      timestamp
    });
  });
  
  return assessmentAnswers;
}

// Helper function to extract interests from V1 responses
function extractInterestsFromV1(responses: { [key: string]: any }): string[] {
  const interests: string[] = [];
  
  // Add career category as interest
  if (responses.q3a_career_categories) {
    interests.push(responses.q3a_career_categories);
  }
  
  // Add specific career as interest
  if (responses.q3a2_engineering_careers) {
    interests.push('Engineering: ' + responses.q3a2_engineering_careers);
  }
  
  // Add interests from text field
  if (responses.q8_interests_text) {
    interests.push(responses.q8_interests_text);
  }
  
  // Add traits as interests
  if (responses.q10_traits && Array.isArray(responses.q10_traits)) {
    interests.push(...responses.q10_traits);
  }
  
  return interests.filter(Boolean);
}

// Helper function to extract skills from V1 responses
function extractSkillsFromV1(responses: { [key: string]: any }): string[] {
  const skills: string[] = [];
  
  // Extract skills from academic performance
  if (responses.q4_academic_performance) {
    Object.entries(responses.q4_academic_performance).forEach(([subject, performance]) => {
      if (performance === 'Excellent' || performance === 'Good') {
        skills.push(subject);
      }
    });
  }
  
  // Extract skills from experience
  if (responses.q9_experience_text) {
    // Simple keyword extraction for skills
    const experienceText = responses.q9_experience_text.toLowerCase();
    const skillKeywords = ['programming', 'coding', 'design', 'leadership', 'teamwork', 'communication', 'problem solving', 'mathematics', 'science', 'writing', 'research'];
    
    skillKeywords.forEach(keyword => {
      if (experienceText.includes(keyword)) {
        skills.push(keyword);
      }
    });
  }
  
  return skills.filter(Boolean);
}

// Helper function to map education willingness to education goal
function mapEducationWillingness(willingness: string): string {
  const mapping = {
    'work_immediately': 'high-school',
    'short_training': 'certificate',
    'college_technical': 'associate',
    'advanced_degree': 'bachelor',
    'not_sure': 'associate'
  };
  
  return mapping[willingness as keyof typeof mapping] || 'associate';
}

// Helper method to map V1 career selections to database careers
function mapV1CareerToDatabase(specificCareer: string): any {
  // Import career service to get career data
  const { CareerService } = require('../services/careerService');
  const allCareers = CareerService.getAllCareers();
  
  // Direct mapping for engineering careers
  const engineeringMapping = {
    'aerospace_engineer': 'Aerospace Engineer',
    'mechanical_engineer': 'Mechanical Engineer',
    'electrical_engineer': 'Electrical Engineer',
    'civil_engineer': 'Civil Engineer',
    'chemical_engineer': 'Chemical Engineer',
    'biomedical_engineer': 'Biomedical Engineer',
    'environmental_engineer': 'Environmental Engineer',
    'materials_engineer': 'Materials Engineer',
    'industrial_engineer': 'Industrial Engineer',
    'systems_engineer': 'Systems Engineer',
    'robotics_engineer': 'Robotics Engineer',
    'petroleum_engineer': 'Petroleum Engineer'
  };
  
  // Direct mapping for other careers
  const careerMapping = {
    ...engineeringMapping,
    'registered_nurse': 'Registered Nurse',
    'software_developer': 'Software Developer',
    'web_developer': 'Web Developer',
    'electrician': 'Electrician',
    'plumber': 'Plumber',
    'construction_worker': 'Construction Worker',
    'police_officer': 'Police Officer',
    'firefighter': 'Firefighter',
    'graphic_designer': 'Graphic Designer',
    'photographer': 'Photographer'
  };
  
  const mappedTitle = careerMapping[specificCareer as keyof typeof careerMapping];
  
  if (mappedTitle) {
    const career = allCareers.find((c: any) => c.title === mappedTitle);
    if (career) {
      return career;
    }
  }
  
  // If no direct mapping, try partial matching
  const partialMatch = allCareers.find((c: any) => 
    c.title.toLowerCase().includes(specificCareer.toLowerCase()) ||
    specificCareer.toLowerCase().includes(c.title.toLowerCase())
  );
  
  if (partialMatch) {
    return partialMatch;
  }
  
  return null;
}

// Helper method to generate category-based matches
function generateCategoryMatches(category: string): any[] {
  const { CareerService } = require('../services/careerService');
  const allCareers = CareerService.getAllCareers();
  
  const categoryMapping = {
    'engineering': ['infrastructure'],
    'trade': ['infrastructure', 'manufacturing'],
    'technology': ['technology'],
    'healthcare': ['healthcare'],
    'business_management': ['business', 'finance'],
    'educator': ['education'],
    'public_safety': ['public-service'],
    'researcher': ['science'],
    'artist': ['creative'],
    'law': ['legal']
  };
  
  const sectors = categoryMapping[category as keyof typeof categoryMapping] || [];
  const categoryMatches = allCareers.filter((c: any) => sectors.includes(c.sector));
  
  return categoryMatches.slice(0, 6).map((career: any, index: number) => ({
    career,
    matchScore: 85 - (index * 5), // Decreasing scores
    explanation: `This career aligns with your selected category: ${category}`,
    reasoningFactors: [
      `Category match: ${category}`,
      `Sector alignment: ${career.sector}`,
      'Good potential based on category selection'
    ]
  }));
}

// Helper method to generate exploration matches
function generateExplorationMatches(responses: any): any[] {
  const { CareerService } = require('../services/careerService');
  const allCareers = CareerService.getAllCareers();
  
  // Return diverse career options for exploration
  const diverseCareers = [
    'Registered Nurse',
    'Software Developer', 
    'Electrician',
    'Teacher',
    'Graphic Designer',
    'Police Officer'
  ];
  
  const matches = diverseCareers.map((title, index) => {
    const career = allCareers.find((c: any) => c.title === title);
    if (career) {
      return {
        career,
        matchScore: 70 - (index * 5),
        explanation: 'This career represents a popular option for exploration based on your responses.',
        reasoningFactors: [
          'Exploration mode - diverse career options',
          'Consider taking assessment again after research',
          'Good starting point for career exploration'
        ]
      };
    }
    return null;
  }).filter(Boolean);
  
  return matches;
}

export default router;