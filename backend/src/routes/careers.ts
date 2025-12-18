import express from 'express';
import { CareerService } from '../services/careerService';
import { SessionService } from '../services/sessionService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { AIRecommendationService } from '../services/aiRecommendationService';
import { LocalJobMarketService } from '../services/localJobMarketService';
import { CourseRecommendationService } from '../services/courseRecommendationService';
import { ApiResponse, AssessmentAnswer } from '../types';

const router = express.Router();

// GET /api/careers - Get all careers
router.get('/', (req, res) => {
  try {
    const careers = CareerService.getAllCareers();
    res.json({
      success: true,
      data: careers,
      message: `Retrieved ${careers.length} careers`
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve careers'
    } as ApiResponse);
  }
});

// GET /api/careers/:id - Get career by ID
router.get('/:id', (req, res) => {
  try {
    const career = CareerService.getCareerById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: career,
      message: 'Career retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve career'
    } as ApiResponse);
  }
});

// POST /api/careers/matches - Get career matches for a profile
router.post('/matches', async (req, res) => {
  try {
    const { sessionId, zipCode } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      } as ApiResponse);
    }

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return res.status(400).json({
        success: false,
        error: 'Valid 5-digit ZIP code is required'
      } as ApiResponse);
    }

    console.log('🔍 Looking for session:', sessionId);

    // Try database sessions first (new system)
    let session = await AssessmentServiceDB.getSessionByToken(sessionId);
    let answers: AssessmentAnswer[] = [];
    let profileData: any = null;

    if (session) {
      console.log('✅ Found database session:', session.id);
      // Get assessment answers from database
      answers = await AssessmentServiceDB.getAnswers(sessionId);
      console.log('📝 Found assessment answers:', answers.length);
      
      // Build profile from assessment answers
      profileData = buildProfileFromAnswers(answers);
      console.log('👤 Built profile from answers:', profileData);
    } else {
      // Fallback to memory sessions (legacy system)
      console.log('🔄 Trying memory session...');
      const memorySession = SessionService.getSession(sessionId);
      if (memorySession && memorySession.profileData) {
        console.log('✅ Found memory session');
        profileData = memorySession.profileData;
        answers = memorySession.assessmentAnswers || [];
      }
    }

    if (!profileData) {
      console.log('❌ No session or profile found');
      return res.status(404).json({
        success: false,
        error: 'Session or profile not found. Please complete the assessment first.'
      } as ApiResponse);
    }

    // Get career matches
    console.log('🎯 Getting career matches for profile...');
    const matches = CareerService.getCareerMatches(profileData, zipCode);
    console.log('🎯 Found career matches:', matches.length);

    // Generate AI-powered recommendations
    console.log('🤖 Calling AI recommendation service...');
    const aiRecommendations = await AIRecommendationService.generateRecommendations(
      profileData,
      answers,
      matches,
      zipCode,
      profileData.grade || 11
    );

    // Get local job market data
    console.log('🌍 Getting local job market data...');
    const localJobMarket = await LocalJobMarketService.getLocalJobMarket(zipCode, matches);

    // Generate academic plan
    console.log('📚 Getting course recommendations...');
    const academicPlan = CourseRecommendationService.generateAcademicPlan(
      profileData,
      matches,
      11 // Default grade, could be enhanced to get from user profile
    );

    res.json({
      success: true,
      data: {
        matches,
        profile: profileData,
        totalMatches: matches.length,
        aiRecommendations,
        localJobMarket,
        academicPlan,
        generatedAt: new Date().toISOString()
      },
      message: `Found ${matches.length} career matches with AI-powered recommendations`
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting career matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get career matches'
    } as ApiResponse);
  }
});

// GET /api/careers/my-matches - Get career matches for authenticated user
router.get('/my-matches', (req, res) => {
  try {
    // This would be implemented when we add proper user profile storage
    // For now, redirect to session-based matches
    res.status(501).json({
      success: false,
      error: 'User-based matches not implemented yet. Please use session-based assessment.',
      message: 'Complete the assessment to get personalized matches'
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting user matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user matches'
    } as ApiResponse);
  }
});

// GET /api/careers/:id/pathway - Get career pathway
router.get('/:id/pathway', (req, res) => {
  try {
    const career = CareerService.getCareerById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found'
      } as ApiResponse);
    }

    // Generate a simple pathway (in production, this would be more detailed)
    const pathway = {
      careerId: career.id,
      stages: [
        {
          order: 1,
          title: 'High School Preparation',
          description: 'Take relevant courses and explore the field',
          duration: '1-4 years',
          requirements: ['Complete high school', 'Take science/math courses', 'Volunteer or shadow professionals'],
          providers: ['Your local high school'],
          cost: 0
        },
        {
          order: 2,
          title: 'Training & Education',
          description: `Complete ${career.requiredEducation} program`,
          duration: career.requiredEducation === 'certificate' ? '6-18 months' : '2-4 years',
          requirements: career.certifications,
          providers: ['Community colleges', 'Vocational schools', 'Apprenticeship programs'],
          cost: career.requiredEducation === 'certificate' ? 5000 : 15000
        },
        {
          order: 3,
          title: 'Entry-Level Position',
          description: `Start working as ${career.title}`,
          duration: '1-3 years',
          requirements: ['Complete training', 'Obtain certifications', 'Pass background checks'],
          providers: ['Local employers'],
          cost: 0
        },
        {
          order: 4,
          title: 'Career Growth',
          description: 'Advance to senior positions or specializations',
          duration: 'Ongoing',
          requirements: ['Continuing education', 'Additional certifications', 'Experience'],
          providers: ['Professional organizations', 'Employers'],
          cost: 2000
        }
      ],
      totalDuration: career.requiredEducation === 'certificate' ? '2-6 years' : '4-8 years',
      estimatedCost: career.requiredEducation === 'certificate' ? 5000 : 17000
    };

    res.json({
      success: true,
      data: pathway,
      message: 'Career pathway retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting career pathway:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get career pathway'
    } as ApiResponse);
  }
});

/**
 * Build profile data from assessment answers
 */
function buildProfileFromAnswers(answers: AssessmentAnswer[]): any {
  const profile: any = {
    interests: [],
    skills: [],
    educationGoal: 'certificate',
    workEnvironment: 'mixed',
    grade: 11
  };

  // Extract data from assessment answers
  answers.forEach(answer => {
    switch (answer.questionId) {
      case 'interests':
      case 'q1': // Interests question
        if (typeof answer.answer === 'string') {
          // Handle comma-separated interests
          profile.interests = answer.answer.split(',').map(s => s.trim()).filter(s => s);
        } else if (Array.isArray(answer.answer)) {
          profile.interests = answer.answer;
        }
        break;
        
      case 'skills':
      case 'q2': // Skills question
        if (typeof answer.answer === 'string') {
          profile.skills = answer.answer.split(',').map(s => s.trim()).filter(s => s);
        } else if (Array.isArray(answer.answer)) {
          profile.skills = answer.answer;
        }
        break;
        
      case 'education':
      case 'q3': // Education goal
        profile.educationGoal = answer.answer;
        break;
        
      case 'work_environment':
      case 'q4': // Work environment
        profile.workEnvironment = answer.answer;
        break;
        
      case 'grade':
      case 'q5': // Grade level
        profile.grade = parseInt(answer.answer as string) || 11;
        break;
        
      case 'zip_code':
        profile.zipCode = answer.answer;
        break;
        
      default:
        // Handle other questions by mapping to interests or skills
        if (answer.questionId.includes('interest') || answer.questionId.includes('like')) {
          if (!profile.interests.includes(answer.answer)) {
            profile.interests.push(answer.answer);
          }
        }
        break;
    }
  });

  // Ensure we have some default interests if none found
  if (profile.interests.length === 0) {
    profile.interests = ['General exploration'];
  }

  // Ensure we have some default skills if none found
  if (profile.skills.length === 0) {
    profile.skills = ['Communication', 'Problem solving'];
  }

  console.log('🔧 Built profile:', {
    interests: profile.interests,
    skills: profile.skills,
    educationGoal: profile.educationGoal,
    workEnvironment: profile.workEnvironment,
    grade: profile.grade
  });

  return profile;
}

// Debug endpoints for troubleshooting AI recommendations
router.get('/debug/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  console.log('🔍 DEBUG: Looking for session:', sessionId);
  
  try {
    // Try database session
    const dbSession = await AssessmentServiceDB.getSessionByToken(sessionId);
    console.log('📊 DEBUG: Database session found:', !!dbSession);
    
    let answers: AssessmentAnswer[] = [];
    let profileData: any = null;
    
    if (dbSession) {
      console.log('📊 DEBUG: Database session details:', {
        id: dbSession.id,
        status: dbSession.status,
        zipCode: dbSession.zipCode
      });
      
      answers = await AssessmentServiceDB.getAnswers(sessionId);
      console.log('📝 DEBUG: Answers count:', answers.length);
      console.log('📝 DEBUG: Sample answers:', answers.slice(0, 3));
      
      profileData = buildProfileFromAnswers(answers);
      console.log('🔧 DEBUG: Built profile:', profileData);
    }
    
    // Try memory session
    const memSession = SessionService.getSession(sessionId);
    console.log('💾 DEBUG: Memory session found:', !!memSession);
    
    if (memSession) {
      console.log('💾 DEBUG: Memory session details:', {
        hasProfileData: !!memSession.profileData,
        hasAnswers: !!memSession.assessmentAnswers
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId,
        databaseSession: !!dbSession,
        databaseSessionDetails: dbSession ? {
          id: dbSession.id,
          status: dbSession.status,
          zipCode: dbSession.zipCode
        } : null,
        memorySession: !!memSession,
        answersCount: answers.length,
        profileBuilt: !!profileData,
        profileSample: profileData ? {
          interests: profileData.interests,
          skills: profileData.skills,
          educationGoal: profileData.educationGoal
        } : null
      },
      message: 'Debug information retrieved',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ DEBUG Error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId 
    });
  }
});

router.post('/debug/ai-test', async (req, res) => {
  const { interests = ['Healthcare', 'Technology'], zipCode = '12345' } = req.body;
  
  console.log('🤖 DEBUG: Testing AI service directly');
  console.log('🤖 DEBUG: Test interests:', interests);
  console.log('🔑 DEBUG: OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
  console.log('🔑 DEBUG: API Key length:', process.env.OPENAI_API_KEY?.length || 0);
  
  try {
    // Create mock profile and answers
    const mockProfile = {
      interests,
      skills: ['Communication', 'Problem solving'],
      educationGoal: 'certificate',
      workEnvironment: 'mixed',
      grade: 11
    };
    
    const mockAnswers: AssessmentAnswer[] = [
      { questionId: 'interests', answer: interests.join(', '), sessionId: 'debug-session' },
      { questionId: 'skills', answer: 'Communication, Problem solving', sessionId: 'debug-session' }
    ];
    
    // Get some career matches
    const matches = CareerService.getCareerMatches(mockProfile, zipCode);
    console.log('🎯 DEBUG: Found career matches:', matches.length);
    
    // Test AI service
    const aiRecommendations = await AIRecommendationService.generateRecommendations(
      mockProfile,
      mockAnswers,
      matches,
      zipCode,
      11
    );
    
    console.log('✅ DEBUG: AI recommendations generated successfully');
    
    res.json({
      success: true,
      data: {
        mockProfile,
        careerMatches: matches.length,
        aiRecommendations: {
          hasCareerPathway: !!aiRecommendations.careerPathway,
          hasSkillGaps: !!aiRecommendations.skillGaps,
          hasActionItems: !!aiRecommendations.actionItems,
          hasLocalJobs: !!aiRecommendations.localJobs
        },
        openaiKeyPresent: !!process.env.OPENAI_API_KEY
      },
      message: 'AI service test completed successfully'
    });
  } catch (error) {
    console.error('❌ DEBUG: AI service test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      openaiKeyPresent: !!process.env.OPENAI_API_KEY
    });
  }
});

router.get('/debug/flow/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const zipCode = '12345'; // Default for testing
  
  console.log('🔄 DEBUG: Testing complete flow for session:', sessionId);
  
  try {
    // Step 1: Look for session
    console.log('🔍 DEBUG STEP 1: Looking for session');
    let session = await AssessmentServiceDB.getSessionByToken(sessionId);
    let answers: AssessmentAnswer[] = [];
    let profileData: any = null;

    if (session) {
      console.log('✅ DEBUG STEP 1: Found database session:', session.id);
      
      // Step 2: Get answers
      console.log('📝 DEBUG STEP 2: Getting assessment answers');
      answers = await AssessmentServiceDB.getAnswers(sessionId);
      console.log('📝 DEBUG STEP 2: Found answers:', answers.length);
      
      // Step 3: Build profile
      console.log('🔧 DEBUG STEP 3: Building profile from answers');
      profileData = buildProfileFromAnswers(answers);
      console.log('👤 DEBUG STEP 3: Built profile:', profileData);
    } else {
      console.log('🔄 DEBUG STEP 1: Trying memory session...');
      const memorySession = SessionService.getSession(sessionId);
      if (memorySession && memorySession.profileData) {
        console.log('✅ DEBUG STEP 1: Found memory session');
        profileData = memorySession.profileData;
        answers = memorySession.assessmentAnswers || [];
      } else {
        console.log('❌ DEBUG STEP 1: No session found');
        return res.json({
          success: false,
          error: 'No session found',
          step: 1,
          sessionId
        });
      }
    }

    // Step 4: Get career matches
    console.log('🎯 DEBUG STEP 4: Getting career matches');
    const matches = CareerService.getCareerMatches(profileData, zipCode);
    console.log('🎯 DEBUG STEP 4: Found matches:', matches.length);

    // Step 5: Call AI service
    console.log('🤖 DEBUG STEP 5: Calling AI recommendation service');
    const aiRecommendations = await AIRecommendationService.generateRecommendations(
      profileData,
      answers,
      matches,
      zipCode,
      profileData.grade || 11
    );
    console.log('✅ DEBUG STEP 5: AI recommendations completed');

    res.json({
      success: true,
      data: {
        step1_sessionFound: !!session || !!SessionService.getSession(sessionId),
        step2_answersCount: answers.length,
        step3_profileBuilt: !!profileData,
        step4_matchesFound: matches.length,
        step5_aiCompleted: !!aiRecommendations,
        sessionType: session ? 'database' : 'memory',
        profileSample: profileData ? {
          interests: profileData.interests,
          skills: profileData.skills
        } : null
      },
      message: 'Complete flow test completed successfully'
    });
  } catch (error) {
    console.error('❌ DEBUG: Flow test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
  }
});

export default router;
