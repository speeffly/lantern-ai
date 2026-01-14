import express from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { AssessmentServiceDB } from '../services/assessmentServiceDB';
import { CareerPlanService } from '../services/careerPlanService';
import { RelationshipService } from '../services/relationshipService';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthRequest extends express.Request {
  userId?: number;
  userRole?: string;
}

/**
 * Authenticate parent and verify access to child
 */
function authenticateParent(req: AuthRequest): { parentId: number; childId: number } {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = jwt.verify(token, JWT_SECRET) as any;
  
  // Handle both token formats: { userId, role } and { user: { id, role } }
  const userId = decoded.userId || decoded.user?.id;
  const userRole = decoded.role || decoded.user?.role;
  
  console.log('🔍 Parent auth - Decoded token:', { userId, role: userRole, fullDecoded: decoded });
  
  if (userRole !== 'parent') {
    console.log('❌ Parent auth failed - User role is:', userRole);
    throw new Error(`Access denied. Parent role required. Current role: ${userRole}`);
  }

  const childId = parseInt(req.params.childId || req.query.childId as string);
  
  if (!childId || isNaN(childId)) {
    throw new Error('Invalid child ID');
  }

  return {
    parentId: userId,
    childId
  };
}

/**
 * GET /api/parent/child/:childId/progress
 * Get child's assessment progress and career data
 */
router.get('/child/:childId/progress', async (req, res) => {
  try {
    const { parentId, childId } = authenticateParent(req as AuthRequest);

    // Verify the child belongs to this parent
    const parent = await UserService.getUserById(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    // Get parent's children from database using RelationshipService
    const children = await RelationshipService.getChildrenForParent(parentId);
    const isParentOfChild = children.some((c: any) => c.id === childId);

    if (!isParentOfChild) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this child\'s progress'
      });
    }

    // Get child's basic info
    const child = await UserService.getUserById(childId);
    const childProfile = await UserService.getStudentProfile(childId);

    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child not found'
      });
    }

    // Get assessment status
    const assessmentSessions = await AssessmentServiceDB.getUserSessions(childId);
    const completedSessions = assessmentSessions.filter(s => 
      s.status === 'completed' || s.completed_at
    );
    const hasCompletedAssessment = completedSessions.length > 0;
    const lastSession = completedSessions[0];

    // Get career recommendations if assessment is completed
    let careerMatches: any[] = [];
    if (hasCompletedAssessment) {
      try {
        careerMatches = await CareerPlanService.getUserCareerRecommendations(childId);
      } catch (err) {
        console.log('Could not fetch career recommendations:', err);
      }
    }

    // Format last activity
    let lastActivity: string | undefined;
    if (lastSession?.completed_at) {
      const date = new Date(lastSession.completed_at);
      lastActivity = date.toLocaleDateString();
    }

    res.json({
      success: true,
      data: {
        id: child.id,
        firstName: (child as any).first_name,
        lastName: (child as any).last_name,
        email: child.email,
        grade: (childProfile as any)?.current_grade,
        assessmentCompleted: hasCompletedAssessment,
        assessmentCount: assessmentSessions.length,
        lastActivity,
        careerMatches: careerMatches.map((match: any) => ({
          id: match.career_id,
          title: match.career_title,
          matchScore: match.match_score,
          sector: match.sector
        }))
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching child progress:', error);
    
    if (error.message === 'No token provided' || error.message.includes('Access denied')) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch child progress'
    });
  }
});

export default router;
