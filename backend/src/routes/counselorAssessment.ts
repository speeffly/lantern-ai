import express from 'express';
import multer from 'multer';
import path from 'path';
import { CounselorGuidanceService, CounselorAssessmentResponse } from '../services/counselorGuidanceService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { CareerPlanService } from '../services/careerPlanService';
import { AuthServiceDB } from '../services/authServiceDB';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';
// File system imports removed - using embedded questions instead

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/transcripts/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'transcript-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and CSV files are allowed'));
    }
  }
});


// GET /api/counselor-assessment/questions
router.get('/questions', async (req, res) => {
  try {
    // Check if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userProfile = null;
    
    if (token) {
      try {
        const user = AuthServiceDB.verifyToken(token);
        if (user) {
          userProfile = await AuthServiceDB.getUserProfile(parseInt(user.id));
        }
      } catch (error) {
        // Token invalid, continue as anonymous user
        console.log('Invalid token, continuing as anonymous user');
      }
    }

    // Embedded counselor questions to avoid file path issues in deployment
    const allQuestions = [
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
      },
      {
        "id": "work_experience",
        "order": 11,
        "text": "What previous work or volunteer experience do you have? Include any part-time jobs, internships, volunteer work, family business involvement, or other hands-on experience. If you don't have any yet, just write 'None yet' and tell us what you'd like to try.",
        "type": "free_text",
        "category": "experience",
        "placeholder": "Example: I worked at a local restaurant as a server for 6 months, volunteered at the animal shelter on weekends, helped with my family's farm during summers, or 'None yet, but I'm interested in trying retail or healthcare volunteering'...",
        "minLength": 20,
        "maxLength": 500
      },
      {
        "id": "academic_performance",
        "order": 12,
        "text": "Share your grades or academic performance (Optional). This helps me understand your academic strengths and suggest careers that match your abilities.",
        "type": "combined_input",
        "category": "academics",
        "fields": {
          "inputMethod": {
            "type": "radio",
            "options": ["Type grades manually", "Upload transcript file"],
            "required": false
          },
          "gradesText": {
            "type": "textarea",
            "placeholder": "Example: 'Math: A, Science: B+, English: A-, GPA: 3.4' or 'Strong in STEM classes, struggle with writing, honor roll last semester'...",
            "maxLength": 500,
            "required": false
          },
          "transcriptFile": {
            "type": "file",
            "accept": ".pdf,.csv",
            "placeholder": "Upload your transcript (PDF or CSV format)",
            "required": false
          }
        },
        "required": false
      },
      {
        "id": "legacy_impact",
        "order": 13,
        "text": "How do you want to be remembered? What kind of impact do you want to have on the world or the people around you?",
        "type": "free_text",
        "category": "values",
        "placeholder": "Think about the legacy you want to leave behind. For example: 'I want to be remembered as someone who helped sick children get better' or 'I want to be known for building things that make people's lives easier' or 'I want to leave the world a little better than I found it'...",
        "minLength": 30,
        "maxLength": 500,
        "required": true
      },
      {
        "id": "personal_traits",
        "order": 14,
        "text": "Which personal traits best describe you? (Select all that apply)",
        "type": "multiple_choice_with_other",
        "category": "personality",
        "options": [
          "Creative and artistic",
          "Analytical and logical",
          "Compassionate and caring",
          "Leadership-oriented",
          "Detail-oriented and organized",
          "Adventurous and risk-taking",
          "Patient and persistent",
          "Outgoing and social",
          "Independent and self-reliant",
          "Collaborative and team-focused",
          "Curious and inquisitive",
          "Practical and hands-on"
        ],
        "hasOtherOption": true,
        "otherPlaceholder": "Describe other traits that define you...",
        "required": true
      },
      {
        "id": "inspiration_role_models",
        "order": 15,
        "text": "Who inspires you and why? This could be someone you know personally, a public figure, historical person, or fictional character.",
        "type": "free_text",
        "category": "values",
        "placeholder": "Tell me about someone who inspires you and what qualities they have that you admire. For example: 'My grandmother inspires me because she never gave up despite facing many challenges' or 'I'm inspired by Marie Curie because she broke barriers in science' or 'My coach inspires me because they believe in everyone's potential'...",
        "minLength": 30,
        "maxLength": 500,
        "required": true
      }
    ];
    
    // Filter questions based on user authentication and profile
    let questions = allQuestions;
    let prefilledData = {};
    
    if (userProfile && userProfile.role === 'student') {
      // For logged-in students, skip the first question if they have grade and zipCode
      const studentProfile = userProfile.profile; // Note: profile is nested under 'profile'
      if (studentProfile && studentProfile.grade && studentProfile.zip_code) {
        // Skip the first question (location_grade)
        questions = allQuestions.filter(q => q.id !== 'location_grade');
        
        // Renumber the remaining questions
        questions = questions.map((q, index) => ({
          ...q,
          order: index + 1
        }));
        
        // Provide prefilled data for the assessment
        prefilledData = {
          grade: studentProfile.grade.toString(),
          zipCode: studentProfile.zip_code
        };
        
        console.log(`📝 Skipping first question for logged-in student. Grade: ${studentProfile.grade}, ZIP: ${studentProfile.zip_code}`);
      }
    }
    
    res.json({
      success: true,
      data: {
        questions,
        prefilledData,
        isAuthenticated: !!userProfile,
        userRole: userProfile?.role || null
      },
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
router.post('/submit', upload.single('transcriptFile'), async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    let responses = req.body.responses;
    
    // Parse responses if it's a string (from FormData)
    if (typeof responses === 'string') {
      responses = JSON.parse(responses);
    }

    if (!responses) {
      return res.status(400).json({
        success: false,
        error: 'Assessment responses are required'
      } as ApiResponse);
    }

    // Check if user is authenticated and get their profile
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userProfile = null;
    
    if (token || userId) {
      try {
        if (token) {
          const user = AuthServiceDB.verifyToken(token);
          if (user) {
            userProfile = await AuthServiceDB.getUserProfile(parseInt(user.id));
          }
        } else if (userId) {
          userProfile = await AuthServiceDB.getUserProfile(parseInt(userId));
        }
      } catch (error) {
        console.log('Could not get user profile, continuing with provided data');
      }
    }

    // Auto-fill grade and zipCode for logged-in students if not provided
    if (userProfile && userProfile.role === 'student' && userProfile.profile) {
      const studentProfile = userProfile.profile; // Note: profile is nested under 'profile'
      
      // If grade and zipCode are missing from responses, use profile data
      if (!responses.grade && studentProfile.grade) {
        responses.grade = studentProfile.grade.toString();
        console.log(`📝 Auto-filled grade from profile: ${responses.grade}`);
      }
      
      if (!responses.zipCode && studentProfile.zip_code) {
        responses.zipCode = studentProfile.zip_code;
        console.log(`📝 Auto-filled zipCode from profile: ${responses.zipCode}`);
      }
    }

    // Handle uploaded file
    if (req.file) {
      console.log('📁 Transcript file uploaded:', req.file.filename);
      // Add file info to responses
      if (!responses.academicPerformance) {
        responses.academicPerformance = {};
      }
      responses.academicPerformance.transcriptFileName = req.file.filename;
      responses.academicPerformance.transcriptPath = req.file.path;
      responses.academicPerformance.originalFileName = req.file.originalname;
    }

    // Validate required fields
    if (!responses.grade || !responses.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Grade and ZIP code are required'
      } as ApiResponse);
    }

    // Validate ZIP code format (5 digits only)
    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(responses.zipCode)) {
      return res.status(400).json({
        success: false,
        error: 'ZIP code must be exactly 5 digits (e.g., 12345)'
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
          counselorRecommendation.aiRecommendations, // AI recommendations
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