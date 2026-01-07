import express from 'express';
import { CounselorService } from '../services/counselorService';
import { authenticateToken } from '../middleware/auth';

// Define the authenticated request interface
interface AuthenticatedRequest extends express.Request {
  user?: {
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  };
}

const router = express.Router();

/**
 * Get counselor dashboard statistics
 */
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log(`📊 Getting counselor stats for counselor ${counselorId}`);
    const stats = await CounselorService.getCounselorStats(counselorId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting counselor stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get counselor statistics'
    });
  }
});

/**
 * Get all students with progress for counselor
 */
router.get('/students', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log(`👥 Getting students with progress for counselor ${counselorId}`);
    const studentsWithProgress = await CounselorService.getStudentsWithProgress(counselorId);

    res.json({
      success: true,
      data: studentsWithProgress
    });
  } catch (error) {
    console.error('❌ Error getting students with progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get students'
    });
  }
});

/**
 * Get detailed student information
 */
router.get('/students/:studentId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const studentId = parseInt(req.params.studentId);

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`👤 Getting student details for student ${studentId}, counselor ${counselorId}`);
    const studentDetails = await CounselorService.getStudentDetails(counselorId, studentId);

    res.json({
      success: true,
      data: studentDetails
    });
  } catch (error) {
    console.error('❌ Error getting student details:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get student details'
    });
  }
});

/**
 * Add student to counselor's caseload
 */
router.post('/students', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const { studentEmail } = req.body;

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!studentEmail) {
      return res.status(400).json({ success: false, error: 'Student email is required' });
    }

    console.log(`➕ Adding student ${studentEmail} to counselor ${counselorId}`);
    await CounselorService.addStudentToCounselor(counselorId, studentEmail);

    res.json({
      success: true,
      message: 'Student added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding student to counselor:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add student'
    });
  }
});

/**
 * Remove student from counselor's caseload
 */
router.delete('/students/:studentId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const studentId = parseInt(req.params.studentId);

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`➖ Removing student ${studentId} from counselor ${counselorId}`);
    await CounselorService.removeStudentFromCounselor(counselorId, studentId);

    res.json({
      success: true,
      message: 'Student removed successfully'
    });
  } catch (error) {
    console.error('❌ Error removing student from counselor:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove student'
    });
  }
});

/**
 * Create counselor note for student
 */
router.post('/students/:studentId/notes', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const studentId = parseInt(req.params.studentId);
    const { noteType, title, content, isSharedWithParent } = req.body;

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    if (!noteType || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note type, title, and content are required' 
      });
    }

    console.log(`📝 Creating note for student ${studentId} by counselor ${counselorId}`);
    const note = await CounselorService.createCounselorNote(counselorId, studentId, {
      noteType,
      title,
      content,
      isSharedWithParent: isSharedWithParent || false
    });

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('❌ Error creating counselor note:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create note'
    });
  }
});

/**
 * Get counselor notes for student
 */
router.get('/students/:studentId/notes', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const studentId = parseInt(req.params.studentId);

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`📖 Getting notes for student ${studentId} by counselor ${counselorId}`);
    const notes = await CounselorService.getCounselorNotesForStudent(counselorId, studentId);

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('❌ Error getting counselor notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notes'
    });
  }
});

/**
 * Create assignment for student
 */
router.post('/students/:studentId/assignments', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const studentId = parseInt(req.params.studentId);
    const { assignmentType, title, description, dueDate } = req.body;

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    if (!assignmentType || !title || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Assignment type, title, and description are required' 
      });
    }

    console.log(`📋 Creating assignment for student ${studentId} by counselor ${counselorId}`);
    const assignment = await CounselorService.createStudentAssignment(counselorId, studentId, {
      assignmentType,
      title,
      description,
      dueDate
    });

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('❌ Error creating student assignment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create assignment'
    });
  }
});

/**
 * Get assignments for student
 */
router.get('/students/:studentId/assignments', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const counselorId = req.user?.user?.id;
    const studentId = parseInt(req.params.studentId);

    if (!counselorId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`📚 Getting assignments for student ${studentId} by counselor ${counselorId}`);
    const assignments = await CounselorService.getStudentAssignments(counselorId, studentId);

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('❌ Error getting student assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assignments'
    });
  }
});

/**
 * Update assignment status
 */
router.patch('/assignments/:assignmentId/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const { status } = req.body;

    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: 'Invalid assignment ID' });
    }

    if (!status || !['assigned', 'in_progress', 'completed', 'overdue'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid status is required (assigned, in_progress, completed, overdue)' 
      });
    }

    console.log(`🔄 Updating assignment ${assignmentId} status to ${status}`);
    const assignment = await CounselorService.updateAssignmentStatus(assignmentId, status);

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('❌ Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment status'
    });
  }
});

export default router;