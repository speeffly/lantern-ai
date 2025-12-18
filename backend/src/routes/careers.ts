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

export default router;
