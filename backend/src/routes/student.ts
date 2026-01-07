import express from 'express';
import { AuthServiceDB } from '../services/authServiceDB';
import { DatabaseAdapter } from '../services/databaseAdapter';

const router = express.Router();

// Helper function to authenticate student requests
const authenticateStudent = (req: express.Request): { success: boolean; studentId?: number; error?: string } => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return { success: false, error: 'Invalid token' };
    }

    if (user.role !== 'student') {
      return { success: false, error: 'Access denied. Student role required.' };
    }

    return { success: true, studentId: parseInt(user.id) };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

/**
 * Get assignments for the authenticated student
 */
router.get('/assignments', async (req, res) => {
  try {
    const auth = authenticateStudent(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    console.log(`📚 Getting assignments for student ${auth.studentId}`);
    
    const assignments = await DatabaseAdapter.all(`
      SELECT 
        sa.*,
        u.first_name as counselor_first_name,
        u.last_name as counselor_last_name,
        u.email as counselor_email
      FROM student_assignments sa
      LEFT JOIN users u ON sa.counselor_id = u.id
      WHERE sa.student_id = ?
      ORDER BY sa.created_at DESC
    `, [auth.studentId]);

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
 * Update assignment status (student can mark as in_progress or completed)
 */
router.patch('/assignments/:assignmentId/status', async (req, res) => {
  try {
    const auth = authenticateStudent(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const assignmentId = parseInt(req.params.assignmentId);
    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: 'Invalid assignment ID' });
    }

    const { status } = req.body;
    if (!status || !['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid status is required (in_progress, completed)' 
      });
    }

    // Verify the assignment belongs to this student
    const assignment = await DatabaseAdapter.get(`
      SELECT * FROM student_assignments WHERE id = ? AND student_id = ?
    `, [assignmentId, auth.studentId]);

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assignment not found or access denied' 
      });
    }

    // Update the assignment status
    await DatabaseAdapter.run(`
      UPDATE student_assignments 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND student_id = ?
    `, [status, assignmentId, auth.studentId]);

    // Get the updated assignment
    const updatedAssignment = await DatabaseAdapter.get(`
      SELECT 
        sa.*,
        u.first_name as counselor_first_name,
        u.last_name as counselor_last_name,
        u.email as counselor_email
      FROM student_assignments sa
      LEFT JOIN users u ON sa.counselor_id = u.id
      WHERE sa.id = ?
    `, [assignmentId]);

    console.log(`🔄 Student ${auth.studentId} updated assignment ${assignmentId} status to ${status}`);

    res.json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment status updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment status'
    });
  }
});

/**
 * Get assignment details by ID
 */
router.get('/assignments/:assignmentId', async (req, res) => {
  try {
    const auth = authenticateStudent(req);
    if (!auth.success) {
      return res.status(401).json({ success: false, error: auth.error });
    }

    const assignmentId = parseInt(req.params.assignmentId);
    if (isNaN(assignmentId)) {
      return res.status(400).json({ success: false, error: 'Invalid assignment ID' });
    }

    const assignment = await DatabaseAdapter.get(`
      SELECT 
        sa.*,
        u.first_name as counselor_first_name,
        u.last_name as counselor_last_name,
        u.email as counselor_email
      FROM student_assignments sa
      LEFT JOIN users u ON sa.counselor_id = u.id
      WHERE sa.id = ? AND sa.student_id = ?
    `, [assignmentId, auth.studentId]);

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assignment not found or access denied' 
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('❌ Error getting assignment details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get assignment details'
    });
  }
});

export default router;