import express from 'express';
import { CounselorService } from '../services/counselorService';
import { AuthServiceDB } from '../services/authServiceDB';

const router = express.Router();

// Helper function to authenticate counselor requests
const authenticateCounselor = (req: express.Request): { success: boolean; counselorId?: number; error?: string } => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return { success: false, error: 'Invalid token' };
    }

    if (user.role !== 'counselor') {
      return { success: false, error: 'Access denied. Counselor role required.' };
    }

    return { success: true, counselorId: parseInt(user.id) };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

/**
 * Get counselor dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    console.log(`📊 Getting counselor stats for counselor ${auth.counselorId}`);
    const stats = await CounselorService.getCounselorStats(auth.counselorId!);

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
router.get('/students', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    console.log(`👥 Getting students with progress for counselor ${auth.counselorId}`);
    const studentsWithProgress = await CounselorService.getStudentsWithProgress(auth.counselorId!);

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
router.get('/students/:studentId', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`👤 Getting student details for student ${studentId}, counselor ${auth.counselorId}`);
    const studentDetails = await CounselorService.getStudentDetails(auth.counselorId!, studentId);

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
router.post('/students', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const { studentEmail } = req.body;
    if (!studentEmail) {
      return res.status(400).json({ success: false, error: 'Student email is required' });
    }

    console.log(`➕ Adding student ${studentEmail} to counselor ${auth.counselorId}`);
    await CounselorService.addStudentToCounselor(auth.counselorId!, studentEmail);

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
router.delete('/students/:studentId', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`➖ Removing student ${studentId} from counselor ${auth.counselorId}`);
    await CounselorService.removeStudentFromCounselor(auth.counselorId!, studentId);

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
router.post('/students/:studentId/notes', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    const { noteType, title, content, isSharedWithParent } = req.body;
    if (!noteType || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note type, title, and content are required' 
      });
    }

    console.log(`📝 Creating note for student ${studentId} by counselor ${auth.counselorId}`);
    const note = await CounselorService.createCounselorNote(auth.counselorId!, studentId, {
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
router.get('/students/:studentId/notes', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`📖 Getting notes for student ${studentId} by counselor ${auth.counselorId}`);
    const notes = await CounselorService.getCounselorNotesForStudent(auth.counselorId!, studentId);

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
router.post('/students/:studentId/assignments', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    const { assignmentType, title, description, dueDate } = req.body;
    if (!assignmentType || !title || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Assignment type, title, and description are required' 
      });
    }

    console.log(`📋 Creating assignment for student ${studentId} by counselor ${auth.counselorId}`);
    const assignment = await CounselorService.createStudentAssignment(auth.counselorId!, studentId, {
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
router.get('/students/:studentId/assignments', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    console.log(`📚 Getting assignments for student ${studentId} by counselor ${auth.counselorId}`);
    const assignments = await CounselorService.getStudentAssignments(auth.counselorId!, studentId);

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
router.patch('/assignments/:assignmentId/status', async (req, res) => {
  try {
    const auth = authenticateCounselor(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const assignmentId = parseInt(req.params.assignmentId);
    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: 'Invalid assignment ID' });
    }

    const { status } = req.body;
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