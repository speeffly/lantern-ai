import express from 'express';
import multer from 'multer';
import path from 'path';
import { CounselorGuidanceService, CounselorAssessmentResponse } from '../services/counselorGuidanceService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { CareerPlanService } from '../services/careerPlanService';
import { AuthServiceDB } from '../services/authServiceDB';
import { ApiResponse } from '../types';
import { authenticateToken } from '../middleware/auth';
import { requireEmailVerification, checkEmailVerification } from '../middleware/emailVerification';
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

    // Use the updated QuestionnaireService with all required questions
    const { QuestionnaireService } = require('../services/questionnaireService');
    const questionnaire = QuestionnaireService.getQuestionnaire();
    
    // Convert questionnaire format to counselor assessment format and flatten conditional questions
    const counselorQuestions: any[] = [];
    
    const processConditionalQuestions = (conditionalQuestions: any, parentId: string, triggerValue: string) => {
      if (Array.isArray(conditionalQuestions)) {
        // Handle array of questions (like "no" branch)
        conditionalQuestions.forEach((condQ: any) => {
          const conditionalQuestion = {
            id: condQ.id,
            order: counselorQuestions.length + 1,
            text: condQ.label,
            type: condQ.type === 'single_select' ? 'single_choice' : 
                  condQ.type === 'multi_select' ? 'multiple_choice' : 
                  condQ.type === 'matrix' ? 'matrix_radio' :
                  condQ.type === 'combined' ? 'combined' :
                  condQ.type === 'text_long' ? 'free_text' : 
                  condQ.type === 'text' ? 'free_text' : condQ.type,
            category: 'assessment',
            required: condQ.required,
            options: condQ.type === 'matrix' ? condQ.columns : (condQ.options?.map((opt: any) => {
              if (typeof opt === 'string') {
                return { key: opt, label: opt };
              } else {
                return { key: opt.key, label: opt.label };
              }
            }) || []),
            subjects: condQ.type === 'matrix' ? condQ.rows : undefined,
            rows: condQ.rows || [],
            columns: condQ.columns || [],
            fields: condQ.fields,
            placeholder: condQ.placeholder,
            minLength: condQ.minLength,
            maxLength: condQ.maxLength,
            hasOtherOption: false,
            otherPlaceholder: '',
            isConditional: true,
            conditionalParent: parentId,
            conditionalTrigger: triggerValue
          };
          
          counselorQuestions.push(conditionalQuestion);
        });
      } else if (typeof conditionalQuestions === 'object') {
        // Handle object with nested questions (like "yes" branch)
        const question = {
          id: conditionalQuestions.id,
          order: counselorQuestions.length + 1,
          text: conditionalQuestions.label,
          type: conditionalQuestions.type === 'single_select' ? 'single_choice' : 
                conditionalQuestions.type === 'multi_select' ? 'multiple_choice' : 
                conditionalQuestions.type,
          category: 'assessment',
          required: conditionalQuestions.required,
          options: conditionalQuestions.options?.map((opt: any) => {
            if (typeof opt === 'string') {
              return { key: opt, label: opt };
            } else {
              return { key: opt.key, label: opt.label };
            }
          }) || [],
          placeholder: conditionalQuestions.placeholder,
          minLength: conditionalQuestions.minLength,
          maxLength: conditionalQuestions.maxLength,
          hasOtherOption: false,
          otherPlaceholder: '',
          isConditional: true,
          conditionalParent: parentId,
          conditionalTrigger: triggerValue
        };
        
        counselorQuestions.push(question);
        
        // Process nested conditional questions (career categories -> specific careers)
        if (conditionalQuestions.conditional_questions) {
          Object.entries(conditionalQuestions.conditional_questions).forEach(([key, nestedQ]: [string, any]) => {
            if (typeof nestedQ === 'object' && nestedQ.id) {
              // This is a specific career question
              const nestedQuestion = {
                id: nestedQ.id,
                order: counselorQuestions.length + 1,
                text: nestedQ.label,
                type: nestedQ.type === 'single_select' ? 'single_choice' : 
                      nestedQ.type === 'multi_select' ? 'multiple_choice' : 
                      nestedQ.type,
                category: 'assessment',
                required: nestedQ.required,
                options: nestedQ.options?.map((opt: any) => {
                  if (typeof opt === 'string') {
                    return { key: opt, label: opt };
                  } else {
                    return { key: opt.key, label: opt.label };
                  }
                }) || [],
                hasOtherOption: false,
                otherPlaceholder: '',
                isConditional: true,
                conditionalParent: conditionalQuestions.id,
                conditionalTrigger: key
              };
              
              counselorQuestions.push(nestedQuestion);
              
              // Process "other" text fields for specific careers
              if (nestedQ.conditional_questions && nestedQ.conditional_questions.other) {
                const otherQuestion = {
                  id: nestedQ.conditional_questions.other.id,
                  order: counselorQuestions.length + 1,
                  text: nestedQ.conditional_questions.other.label,
                  type: 'free_text',
                  category: 'assessment',
                  required: nestedQ.conditional_questions.other.required,
                  options: [],
                  hasOtherOption: false,
                  otherPlaceholder: '',
                  isConditional: true,
                  conditionalParent: nestedQ.id,
                  conditionalTrigger: 'other'
                };
                
                counselorQuestions.push(otherQuestion);
              }
            } else if (typeof nestedQ === 'object' && nestedQ.type === 'text_long') {
              // This is a direct text question (like "other" category)
              const textQuestion = {
                id: nestedQ.id,
                order: counselorQuestions.length + 1,
                text: nestedQ.label,
                type: 'free_text',
                category: 'assessment',
                required: nestedQ.required,
                options: [],
                hasOtherOption: false,
                otherPlaceholder: '',
                isConditional: true,
                conditionalParent: conditionalQuestions.id,
                conditionalTrigger: key
              };
              
              counselorQuestions.push(textQuestion);
            }
          });
        }
      }
    };
    
    questionnaire.questions.forEach((q: any, index: number) => {
      // Add the main question
      const mainQuestion = {
        id: q.id,
        order: counselorQuestions.length + 1,
        text: q.label,
        type: q.type === 'single_select' ? 'single_choice' : 
              q.type === 'multi_select' ? 'multiple_choice' : 
              q.type === 'matrix' ? 'matrix_radio' :
              q.type === 'combined' ? 'combined' :
              q.type === 'text_long' ? 'free_text' : 
              q.type === 'text' ? 'free_text' : 
              q.type === 'subject_grid' ? 'subject_grid' : q.type,
        category: 'assessment',
        required: q.required,
        options: q.type === 'matrix' ? q.columns : (q.options?.map((opt: any) => {
          if (typeof opt === 'string') {
            return { key: opt, label: opt };
          } else {
            return { key: opt.key, label: opt.label };
          }
        }) || []),
        subjects: q.type === 'matrix' ? q.rows : (q.type === 'subject_grid' ? q.subjects : undefined),
        rows: q.rows || [],
        columns: q.columns || [],
        fields: q.fields,
        conditional_questions: q.conditional_questions,
        description: q.description,
        placeholder: q.placeholder,
        minLength: q.minLength,
        maxLength: q.maxLength,
        hasOtherOption: false,
        otherPlaceholder: ''
      };
      
      counselorQuestions.push(mainQuestion);
      
      // Add conditional questions if they exist
      if (q.conditional_questions) {
        Object.entries(q.conditional_questions).forEach(([triggerValue, conditionalQ]) => {
          processConditionalQuestions(conditionalQ, q.id, triggerValue);
        });
      }
    });

    // Prepare prefilled data if user is authenticated
    let prefilledData = null;
    if (userProfile) {
      prefilledData = {
        grade: userProfile.grade,
        zipCode: userProfile.zipCode
      };
    }

    res.json({
      success: true,
      data: {
        questions: counselorQuestions,
        isAuthenticated: !!userProfile,
        userRole: userProfile?.role || 'anonymous',
        prefilledData
      },
      message: 'Counselor assessment questions retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error getting counselor assessment questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve counselor assessment questions'
    } as ApiResponse);
  }
});

// POST /api/counselor-assessment/submit
router.post('/submit', authenticateToken, requireEmailVerification, upload.single('transcriptFile'), async (req, res) => {
  try {
    const { sessionId } = req.body;
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
    let userId: string | null = null;
    
    if (token) {
      try {
        const user = AuthServiceDB.verifyToken(token);
        if (user) {
          userId = user.id; // Extract userId from verified token
          userProfile = await AuthServiceDB.getUserProfile(parseInt(user.id));
          console.log(`✅ Authenticated user: ${user.id} (${user.email})`);
        }
      } catch (error) {
        console.log('⚠️  Could not verify token, treating as anonymous user');
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

    // Validate required fields - handle new combined grade/zip format
    let grade, zipCode;
    
    if (responses.q1_grade_zip) {
      // New combined format
      grade = responses.q1_grade_zip.grade;
      zipCode = responses.q1_grade_zip.zipCode;
    } else {
      // Legacy format fallback
      grade = responses.grade;
      zipCode = responses.zipCode;
    }
    
    if (!grade || !zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Grade and ZIP code are required'
      } as ApiResponse);
    }

    // Validate ZIP code format (5 digits only)
    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(zipCode)) {
      return res.status(400).json({
        success: false,
        error: 'ZIP code must be exactly 5 digits (e.g., 12345)'
      } as ApiResponse);
    }

    // Ensure legacy format fields are available for downstream processing
    if (!responses.grade) responses.grade = grade;
    if (!responses.zipCode) responses.zipCode = zipCode;

    console.log('🎓 Processing counselor assessment submission...');
    console.log('📋 DETAILED RESPONSES OBJECT:');
    console.log('='.repeat(80));
    console.log('📊 Response Type:', typeof responses);
    console.log('📊 Response Keys:', Object.keys(responses));
    console.log('📊 Response Length:', Object.keys(responses).length);
    console.log('='.repeat(80));
    
    // Print each response element with detailed information
    Object.entries(responses).forEach(([key, value], index) => {
      console.log(`${index + 1}. KEY: "${key}"`);
      console.log(`   TYPE: ${typeof value}`);
      console.log(`   VALUE: ${JSON.stringify(value, null, 2)}`);
      
      // Additional details for objects and arrays
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          console.log(`   ARRAY LENGTH: ${value.length}`);
          console.log(`   ARRAY ELEMENTS: ${value.map(v => typeof v).join(', ')}`);
        } else {
          console.log(`   OBJECT KEYS: ${Object.keys(value).join(', ')}`);
        }
      }
      console.log('   ' + '-'.repeat(50));
    });
    
    console.log('='.repeat(80));
    console.log('📋 END OF RESPONSES OBJECT DETAILS');
    console.log('='.repeat(80));

    // Detect if student is on undecided path
    const isUndecidedPath = detectUndecidedPath(responses);
    console.log(`🤔 Student path detected: ${isUndecidedPath ? 'UNDECIDED' : 'DECIDED'}`);
    console.log('🔍 Detection details:');
    console.log('   - work_preference_main:', responses.work_preference_main);
    console.log('   - Has undecided questions:', Object.keys(responses).filter(key => key.startsWith('undecided_')));
    console.log('   - Total response keys:', Object.keys(responses).length);

    // Force undecided path for testing if requested
    const forceUndecided = req.query.forceUndecided === 'true';
    const finalUndecidedPath = forceUndecided || isUndecidedPath;
    
    if (forceUndecided) {
      console.log('🧪 FORCING UNDECIDED PATH FOR TESTING');
    }

    // Generate appropriate recommendations based on path
    let counselorRecommendation;
    if (finalUndecidedPath) {
      console.log('🎯 Using specialized undecided career matching (3 options)...');
      counselorRecommendation = await CounselorGuidanceService.generateUndecidedCareerMatches(responses);
    } else {
      console.log('📊 Using comprehensive career recommendations...');
      counselorRecommendation = await CounselorGuidanceService.generateDirectCounselorRecommendations(responses);
    }

    // Save assessment session to database if user is logged in
    let assessmentSessionId = null;
    if (userId) {
      console.log(`💾 Saving assessment to database for user ${userId}...`);
      try {
        const session = await AssessmentServiceDB.createSession(parseInt(userId));
        assessmentSessionId = session.id;
        console.log(`✅ Created assessment session: ${session.id}`);

        // Save individual responses as answers
        const answersToSave = Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
          timestamp: new Date()
        }));

        await AssessmentServiceDB.saveAnswers(session.session_token, answersToSave);
        console.log(`✅ Saved ${answersToSave.length} assessment answers`);

        // Update student profile with grade and zipCode if user is authenticated
        if (userId && userProfile && userProfile.role === 'student') {
          try {
            const { UserService } = await import('../services/userService');
            await UserService.updateStudentProfile(parseInt(userId), {
              grade: parseInt(grade),
              zipCode: zipCode
            });
            console.log(`✅ Updated student profile with grade ${grade} and zipCode ${zipCode}`);
          } catch (profileError) {
            console.error('⚠️  Failed to update student profile:', profileError);
            // Don't fail the assessment if profile update fails
          }
        }

        // Complete the session
        await AssessmentServiceDB.completeSession(session.session_token, responses.zipCode || '');
        console.log(`✅ Marked session as completed`);

        // Save career recommendations to database (including FULL recommendations object)
        await CareerPlanService.saveCareerRecommendations(
          session.id,
          parseInt(userId),
          counselorRecommendation.topJobMatches.map((job: any) => ({
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
          counselorRecommendation.topJobMatches.map((job: any) => job.localOpportunities), // local job market
          counselorRecommendation.careerRoadmap, // academic plan
          counselorRecommendation // FULL recommendations object (includes parentSummary, counselorNotes, etc.)
        );
        console.log('✅ Saved career recommendations: 7');

        // Create action plan
        const topCareer = counselorRecommendation.topJobMatches[0];
        if (topCareer) {
          await CareerPlanService.createActionPlan(
            parseInt(userId),
            topCareer.career.id,
            topCareer.career.title,
            counselorRecommendation.careerRoadmap.careerPreparation.skillsToDevelope.map((skill: any) => skill.skill),
            counselorRecommendation.careerRoadmap.postGraduationPath.immediateSteps,
            counselorRecommendation.careerRoadmap.postGraduationPath.careerEntry.advancement,
            [], // skill gaps
            counselorRecommendation.careerRoadmap.careerPreparation.experienceOpportunities
          );
        }

        console.log('✅ Assessment and recommendations saved to database');
      } catch (dbError) {
        console.error('❌ Database save failed:', dbError);
        console.error('   This assessment will only be available in localStorage');
        console.error('   User will lose data on logout or browser clear');
        // Continue with response even if database save fails
      }
    } else {
      console.log('⚠️  No authenticated user - assessment will only be saved to localStorage');
      console.log('   User will lose data on logout or browser clear');
      console.log('   Token present:', !!token);
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
        assessmentResponses: responses, // Include the original responses
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

    // Get assessment answers/responses
    const assessmentAnswers = await AssessmentServiceDB.getAnswers(session.session_token);
    
    // Convert answers array back to responses object
    const assessmentResponses: any = {};
    assessmentAnswers.forEach(answer => {
      try {
        // Try to parse as JSON first (for complex answers)
        assessmentResponses[answer.questionId] = JSON.parse(answer.answer as string);
      } catch {
        // If not JSON, use as string
        assessmentResponses[answer.questionId] = answer.answer;
      }
    });

    // Get career recommendations (which now includes full_recommendations)
    const recommendations = await CareerPlanService.getUserCareerRecommendations(userId);
    
    // Find the recommendation for this session
    const sessionRecommendation = recommendations.find((rec: any) => rec.session_id === parseInt(sessionId));
    
    // If we have full_recommendations, use that (it has the complete assessment results)
    if (sessionRecommendation && sessionRecommendation.full_recommendations) {
      console.log('✅ Returning full recommendations from database');
      res.json({
        success: true,
        data: {
          session,
          recommendations: sessionRecommendation.full_recommendations,
          assessmentResponses, // Include the assessment responses
          actionPlans: [] // Can be populated if needed
        },
        message: 'Assessment results retrieved successfully'
      } as ApiResponse);
      return;
    }
    
    // Fallback: Get action plans if full_recommendations not available
    const actionPlans = await CareerPlanService.getUserActionPlans(userId);

    res.json({
      success: true,
      data: {
        session,
        recommendations,
        assessmentResponses, // Include the assessment responses
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

/**
 * Helper function to detect if student is on undecided career path
 * Based on assessment responses and question patterns
 */
function detectUndecidedPath(responses: any): boolean {
  // Primary check: Look for "unable_to_decide" in work preference (new assessment format)
  const workPreference = responses.work_preference_main || responses.q2_work_preference;
  if (workPreference === 'unable_to_decide') {
    console.log('🤔 Detected undecided path: Work preference is "unable_to_decide"');
    return true;
  }
  
  // Secondary check: Look for "No" answer to career knowledge question (old assessment format)
  const careerKnowledge = responses.q3_career_knowledge;
  if (careerKnowledge === 'no' || careerKnowledge === 'No') {
    console.log('🤔 Detected undecided path: Career knowledge is "No"');
    return true;
  }
  
  // Check for undecided-specific question responses
  const undecidedQuestions = [
    'undecided_interests_hobbies',
    'undecided_work_experience', 
    'undecided_personal_traits',
    'undecided_career_constraints',
    'undecided_education_support',
    'undecided_impact_and_inspiration'
  ];
  
  // If any undecided-specific questions are answered, student is on undecided path
  const hasUndecidedQuestions = undecidedQuestions.some(questionId => 
    responses[questionId] !== undefined && responses[questionId] !== null && responses[questionId] !== ''
  );
  
  if (hasUndecidedQuestions) {
    console.log('🤔 Detected undecided path: Found undecided-specific questions');
    return true;
  }
  
  // Check for work preference indicating uncertainty (legacy support)
  if (workPreference && (
    workPreference.includes('unsure') || 
    workPreference.includes('not sure') ||
    workPreference.includes('undecided')
  )) {
    console.log('🤔 Detected undecided path: Work preference indicates uncertainty');
    return true;
  }
  
  // Check for education commitment uncertainty
  const educationCommitment = responses.education_commitment || responses.q6_education_commitment;
  if (educationCommitment && (
    educationCommitment.includes('unsure') ||
    educationCommitment.includes('not sure') ||
    educationCommitment === 'unsure'
  )) {
    console.log('🤔 Detected undecided path: Education commitment shows uncertainty');
    return true;
  }
  
  // Check for minimal responses indicating lack of direction
  const responseCount = Object.keys(responses).filter(key => 
    responses[key] !== undefined && 
    responses[key] !== null && 
    responses[key] !== '' &&
    !['grade', 'zipCode', 'basic_info', 'q1_grade_zip'].includes(key)
  ).length;
  
  if (responseCount <= 3) {
    console.log('🤔 Detected undecided path: Very few responses provided');
    return true;
  }
  
  console.log('✅ Detected decided path: Student has clear preferences');
  console.log('   Work preference:', workPreference);
  console.log('   Career knowledge:', careerKnowledge);
  console.log('   Response count:', responseCount);
  console.log('   Has undecided questions:', hasUndecidedQuestions);
  return false;
}

export default router;