import express from 'express';
import { CounselorGuidanceService, CounselorAssessmentResponse } from '../services/counselorGuidanceService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { CareerPlanService } from '../services/careerPlanService';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';
// File system imports removed - using embedded questions instead

const router = express.Router();

// GET /api/counselor-assessment/questions
router.get('/questions', (req, res) => {
  try {
    // Embedded counselor questions to avoid file path issues in deployment
    const questions = [
      {
        "id": "location_grade",
        "order": 1,
        "text": "What grade are you currently in, and what's your ZIP code? This helps me find opportunities near you.",
        "type": "combined",
        "category": "basic_info",
        "fields": {
          "grade": {
            "type": "select",
            "options": ["9", "10", "11", "12"],
            "required": true
          },
          "zipCode": {
            "type": "text",
            "placeholder": "12345",
            "maxLength": 5,
            "required": true
          }
        }
      },
      {
        "id": "work_environment",
        "order": 2,
        "text": "Where do you see yourself working? Choose what appeals to you most:",
        "type": "single_choice",
        "category": "work_preferences",
        "options": [
          "Outdoors - construction sites, farms, parks",
          "Indoors - offices, hospitals, schools",
          "Mixed - some indoor, some outdoor work",
          "From home - remote or home-based work",
          "Traveling - different locations regularly"
        ]
      },
      {
        "id": "hands_on_preference",
        "order": 3,
        "text": "How do you prefer to work with your hands and tools?",
        "type": "single_choice",
        "category": "work_style",
        "options": [
          "Love working with tools and building things",
          "Prefer working with people and helping them",
          "Enjoy working with computers and technology",
          "Like working with numbers and data",
          "Prefer creative work like art or design"
        ]
      },
      {
        "id": "problem_solving",
        "order": 4,
        "text": "What kind of problems do you enjoy solving?",
        "type": "single_choice",
        "category": "thinking_style",
        "options": [
          "Fixing things that are broken",
          "Helping people with their challenges",
          "Figuring out how things work",
          "Creating new solutions or ideas",
          "Organizing and planning projects"
        ]
      },
      {
        "id": "helping_others",
        "order": 5,
        "text": "How important is helping others in your future career?",
        "type": "single_choice",
        "category": "values",
        "options": [
          "Very important - I want to directly help people",
          "Somewhat important - I'd like to help but it's not the main focus",
          "Not very important - I prefer other types of work",
          "I'm not sure yet"
        ]
      },
      {
        "id": "education_commitment",
        "order": 6,
        "text": "How much additional education or training are you willing to pursue after high school?",
        "type": "single_choice",
        "category": "education",
        "options": [
          "I want to start working right after high school",
          "A few months to 2 years of training/certification",
          "2-4 years of college or technical school",
          "4+ years of college and possibly graduate school",
          "I'm not sure yet"
        ]
      },
      {
        "id": "income_importance",
        "order": 7,
        "text": "How important is having a high income in your career choice?",
        "type": "single_choice",
        "category": "values",
        "options": [
          "Very important - I want to earn as much as possible",
          "Somewhat important - I want a comfortable living",
          "Not very important - I care more about job satisfaction",
          "I'm not sure yet"
        ]
      },
      {
        "id": "job_security",
        "order": 8,
        "text": "How important is job security and stability to you?",
        "type": "single_choice",
        "category": "values",
        "options": [
          "Very important - I want a stable, secure job",
          "Somewhat important - Some stability would be nice",
          "Not very important - I'm okay with some uncertainty",
          "I prefer variety and change over security"
        ]
      },
      {
        "id": "subjects_strengths",
        "order": 9,
        "text": "Which school subjects are you strongest in? (Select all that apply)",
        "type": "multiple_choice",
        "category": "academic_strengths",
        "options": [
          "Math",
          "Science (Biology, Chemistry, Physics)",
          "English/Language Arts",
          "Social Studies/History",
          "Art/Creative subjects",
          "Physical Education/Health",
          "Technology/Computer Science",
          "Foreign Languages",
          "Business/Economics"
        ]
      },
      {
        "id": "interests_passions",
        "order": 10,
        "text": "Tell me about your interests, hobbies, and what you're passionate about. This helps me understand what might motivate you in a career.",
        "type": "free_text",
        "category": "interests",
        "placeholder": "Describe your interests, hobbies, activities you enjoy, things you're curious about, or causes you care about...",
        "minLength": 20,
        "maxLength": 500
      }
    ];
    
    res.json({
      success: true,
      data: questions,
      message: `Retrieved ${questions.length} counselor assessment questions`
    } as ApiResponse);
  } catch (error) {
    console.error('Error loading counselor questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve counselor questions'
    } as ApiResponse);
  }
});

// POST /api/counselor-assessment/submit
router.post('/submit', async (req, res) => {
  try {
    const { sessionId, responses, userId } = req.body;

    if (!responses) {
      return res.status(400).json({
        success: false,
        error: 'Assessment responses are required'
      } as ApiResponse);
    }

    // Validate required fields
    if (!responses.grade || !responses.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Grade and ZIP code are required'
      } as ApiResponse);
    }

    console.log('🎓 Processing counselor assessment submission...');

    // Generate comprehensive counselor recommendations
    const counselorRecommendation = await CounselorGuidanceService.generateCounselorRecommendations(responses);

    // Save assessment session to database if user is logged in
    let assessmentSessionId = null;
    if (userId) {
      try {
        const session = await AssessmentServiceDB.createSession(parseInt(userId));
        assessmentSessionId = session.id;

        // Save individual responses as answers
        const answersToSave = Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
          timestamp: new Date()
        }));

        await AssessmentServiceDB.saveAnswers(session.session_token, answersToSave);

        // Complete the session
        await AssessmentServiceDB.completeSession(session.session_token, responses.zipCode || '');

        // Save career recommendations to database
        await CareerPlanService.saveCareerRecommendations(
          session.id,
          parseInt(userId),
          counselorRecommendation.topJobMatches.map(job => ({
            careerId: job.career.id,
            career: {
              ...job.career,
              responsibilities: [job.career.description],
              certifications: job.career.certifications || [],
              growthOutlook: job.career.growthOutlook || 'Stable',
              salaryRange: {
                min: Math.round(job.career.averageSalary * 0.8),
                max: Math.round(job.career.averageSalary * 1.2)
              },
              sector: job.career.sector as 'healthcare' | 'infrastructure',
              requiredEducation: job.career.requiredEducation as 'high-school' | 'certificate' | 'associate' | 'bachelor'
            },
            matchScore: job.matchScore,
            reasoningFactors: job.matchReasons,
            localDemand: job.localOpportunities.estimatedJobs > 30 ? 'high' : job.localOpportunities.estimatedJobs > 15 ? 'medium' : 'low',
            localSalary: {
              min: Math.round(job.localOpportunities.averageLocalSalary * 0.8),
              max: Math.round(job.localOpportunities.averageLocalSalary * 1.2),
              location: `Within ${job.localOpportunities.distanceFromStudent} miles`
            },
            localEmployers: job.localOpportunities.topEmployers
          })),
          undefined, // AI recommendations
          counselorRecommendation.topJobMatches.map(job => job.localOpportunities), // local job market
          counselorRecommendation.fourYearPlan // academic plan
        );

        // Create action plan
        const topCareer = counselorRecommendation.topJobMatches[0];
        if (topCareer) {
          await CareerPlanService.createActionPlan(
            parseInt(userId),
            topCareer.career.id,
            topCareer.career.title,
            counselorRecommendation.fourYearPlan.careerPreparation.skillsToDevelope.map(skill => skill.skill),
            counselorRecommendation.fourYearPlan.postGraduationPath.immediateSteps,
            counselorRecommendation.fourYearPlan.postGraduationPath.careerEntry.advancement,
            [], // skill gaps
            counselorRecommendation.fourYearPlan.careerPreparation.experienceOpportunities
          );
        }

        console.log('✅ Assessment and recommendations saved to database');
      } catch (dbError) {
        console.error('⚠️ Database save failed, continuing with response:', dbError);
      }
    }

    // Store in session for anonymous users
    if (sessionId && !userId) {
      // You could implement session storage here if needed
      console.log('📝 Storing results for anonymous session:', sessionId);
    }

    res.json({
      success: true,
      data: {
        assessmentSessionId,
        recommendations: counselorRecommendation,
        summary: {
          totalJobMatches: counselorRecommendation.topJobMatches.length,
          topCareer: counselorRecommendation.topJobMatches[0]?.career.title,
          averageSalary: counselorRecommendation.topJobMatches[0]?.localOpportunities.averageLocalSalary,
          educationPath: counselorRecommendation.topJobMatches[0]?.educationPath.timeToCareer,
          careerReadiness: counselorRecommendation.studentProfile.careerReadiness
        }
      },
      message: 'Counselor assessment completed successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error processing counselor assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process counselor assessment',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// GET /api/counselor-assessment/results/:sessionId
router.get('/results/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    // Get assessment session and results from database
    const session = await AssessmentServiceDB.getSessionById(parseInt(sessionId));
    
    if (!session || session.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Assessment session not found'
      } as ApiResponse);
    }

    // Get career recommendations
    const recommendations = await CareerPlanService.getUserCareerRecommendations(userId);
    
    // Get action plans
    const actionPlans = await CareerPlanService.getUserActionPlans(userId);

    res.json({
      success: true,
      data: {
        session,
        recommendations,
        actionPlans
      },
      message: 'Assessment results retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error retrieving assessment results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment results'
    } as ApiResponse);
  }
});

// GET /api/counselor-assessment/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    // Get user's assessment history
    const sessions = await AssessmentServiceDB.getUserSessions(userId);
    
    res.json({
      success: true,
      data: sessions,
      message: `Retrieved ${sessions.length} assessment sessions`
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error retrieving assessment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment history'
    } as ApiResponse);
  }
});

export default router;