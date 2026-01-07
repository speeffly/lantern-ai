import { DatabaseAdapter } from './databaseAdapter';
import { RelationshipService } from './relationshipService';
import { UserService } from './userService';
import { CareerPlanService } from './careerPlanService';
import { AssessmentServiceDB } from './assessmentServiceDB';
import { User } from '../types';

export interface StudentProgress {
  student: User;
  profile: any;
  assessmentStatus: {
    hasCompletedAssessment: boolean;
    lastAssessmentDate?: string;
    assessmentCount: number;
  };
  careerPlan: {
    hasCareerPlan: boolean;
    topCareer?: string;
    planCreatedDate?: string;
  };
  actionPlan: {
    hasActionPlan: boolean;
    completedSteps: number;
    totalSteps: number;
    lastUpdated?: string;
  };
}

export interface CounselorNote {
  id: number;
  student_id: number;
  counselor_id: number;
  note_type: 'general' | 'career_guidance' | 'academic' | 'personal' | 'parent_communication';
  title: string;
  content: string;
  is_shared_with_parent: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentAssignment {
  id: number;
  counselor_id: number;
  student_id: number;
  assignment_type: 'assessment' | 'career_research' | 'skill_development' | 'course_planning';
  title: string;
  description: string;
  due_date?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
}

export class CounselorService {
  /**
   * Get all students assigned to a counselor with their progress
   */
  static async getStudentsWithProgress(counselorId: number): Promise<StudentProgress[]> {
    try {
      const students = await RelationshipService.getStudentsForCounselor(counselorId);
      const studentsWithProgress: StudentProgress[] = [];

      for (const student of students) {
        const studentId = parseInt(student.id);
        
        // Get student profile
        const profile = await UserService.getStudentProfile(studentId);
        
        // Get assessment status
        const assessmentSessions = await AssessmentServiceDB.getUserSessions(studentId);
        const hasCompletedAssessment = assessmentSessions.length > 0;
        const lastSession = assessmentSessions[0]; // Most recent
        
        // Get career plan status
        const careerRecommendations = await CareerPlanService.getUserCareerRecommendations(studentId);
        const hasCareerPlan = careerRecommendations.length > 0;
        const topCareer = careerRecommendations[0]?.career_matches?.[0]?.career?.title;
        
        // Get action plan status
        const actionPlans = await CareerPlanService.getUserActionPlans(studentId);
        const hasActionPlan = actionPlans.length > 0;
        const completedSteps = actionPlans.reduce((sum, plan) => {
          const actionItems = plan.action_items || [];
          return sum + actionItems.filter((item: any) => item.completed).length;
        }, 0);
        const totalSteps = actionPlans.reduce((sum, plan) => {
          const actionItems = plan.action_items || [];
          return sum + actionItems.length;
        }, 0);

        studentsWithProgress.push({
          student,
          profile,
          assessmentStatus: {
            hasCompletedAssessment,
            lastAssessmentDate: lastSession?.completed_at,
            assessmentCount: assessmentSessions.length
          },
          careerPlan: {
            hasCareerPlan,
            topCareer,
            planCreatedDate: careerRecommendations[0]?.generated_at
          },
          actionPlan: {
            hasActionPlan,
            completedSteps,
            totalSteps,
            lastUpdated: actionPlans[0]?.updated_at
          }
        });
      }

      return studentsWithProgress;
    } catch (error) {
      console.error('❌ Error getting students with progress:', error);
      return [];
    }
  }

  /**
   * Get detailed student information for counselor view
   */
  static async getStudentDetails(counselorId: number, studentId: number): Promise<any> {
    try {
      // Verify counselor has access to this student
      const hasAccess = await RelationshipService.hasPermission(counselorId, studentId);
      if (!hasAccess) {
        throw new Error('Access denied: Counselor not assigned to this student');
      }

      const student = await UserService.getUserById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const profile = await UserService.getStudentProfile(studentId);
      const assessmentSessions = await AssessmentServiceDB.getUserSessions(studentId);
      const careerRecommendations = await CareerPlanService.getUserCareerRecommendations(studentId);
      const actionPlans = await CareerPlanService.getUserActionPlans(studentId);
      const notes = await this.getCounselorNotesForStudent(counselorId, studentId);
      const assignments = await this.getStudentAssignments(counselorId, studentId);

      return {
        student,
        profile,
        assessmentSessions,
        careerRecommendations,
        actionPlans,
        notes,
        assignments
      };
    } catch (error) {
      console.error('❌ Error getting student details:', error);
      throw error;
    }
  }

  /**
   * Add a student to counselor's caseload
   */
  static async addStudentToCounselor(counselorId: number, studentEmail: string): Promise<boolean> {
    try {
      // Find student by email
      const student = await UserService.getUserByEmail(studentEmail);
      if (!student || student.role !== 'student') {
        throw new Error('Student not found or invalid role');
      }

      // Check if relationship already exists
      const existingRelationship = await RelationshipService.getRelationship(
        counselorId, 
        parseInt(student.id), 
        'counselor_student'
      );
      
      if (existingRelationship) {
        throw new Error('Student is already assigned to this counselor');
      }

      // Create relationship
      await RelationshipService.createRelationship(
        counselorId,
        parseInt(student.id),
        'counselor_student',
        counselorId
      );

      console.log(`✅ Added student ${student.email} to counselor ${counselorId}`);
      return true;
    } catch (error) {
      console.error('❌ Error adding student to counselor:', error);
      throw error;
    }
  }

  /**
   * Remove student from counselor's caseload
   */
  static async removeStudentFromCounselor(counselorId: number, studentId: number): Promise<boolean> {
    try {
      const relationship = await RelationshipService.getRelationship(
        counselorId,
        studentId,
        'counselor_student'
      );

      if (!relationship) {
        throw new Error('Student is not assigned to this counselor');
      }

      // Update relationship status to inactive instead of deleting
      await RelationshipService.updateRelationshipStatus(relationship.id, 'inactive');

      console.log(`✅ Removed student ${studentId} from counselor ${counselorId}`);
      return true;
    } catch (error) {
      console.error('❌ Error removing student from counselor:', error);
      throw error;
    }
  }

  /**
   * Create counselor note for student
   */
  static async createCounselorNote(
    counselorId: number,
    studentId: number,
    noteData: {
      noteType: 'general' | 'career_guidance' | 'academic' | 'personal' | 'parent_communication';
      title: string;
      content: string;
      isSharedWithParent?: boolean;
    }
  ): Promise<CounselorNote> {
    try {
      // Verify access
      const hasAccess = await RelationshipService.hasPermission(counselorId, studentId);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      const result = await DatabaseAdapter.run(`
        INSERT INTO counselor_notes (
          student_id, counselor_id, note_type, title, content, is_shared_with_parent
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        counselorId,
        noteData.noteType,
        noteData.title,
        noteData.content,
        noteData.isSharedWithParent ? 1 : 0
      ]);

      const noteId = result.lastID;
      if (!noteId) {
        throw new Error('Failed to create note');
      }

      const note = await this.getCounselorNoteById(noteId);
      if (!note) {
        throw new Error('Failed to retrieve created note');
      }

      console.log(`✅ Created counselor note for student ${studentId}`);
      return note;
    } catch (error) {
      console.error('❌ Error creating counselor note:', error);
      throw error;
    }
  }

  /**
   * Get counselor notes for a student
   */
  static async getCounselorNotesForStudent(counselorId: number, studentId: number): Promise<CounselorNote[]> {
    try {
      const notes = await DatabaseAdapter.all<CounselorNote>(`
        SELECT * FROM counselor_notes 
        WHERE student_id = ? AND counselor_id = ?
        ORDER BY created_at DESC
      `, [studentId, counselorId]);

      return notes;
    } catch (error) {
      console.error('❌ Error getting counselor notes:', error);
      return [];
    }
  }

  /**
   * Get counselor note by ID
   */
  static async getCounselorNoteById(noteId: number): Promise<CounselorNote | null> {
    try {
      const note = await DatabaseAdapter.get<CounselorNote>(`
        SELECT * FROM counselor_notes WHERE id = ?
      `, [noteId]);

      return note || null;
    } catch (error) {
      console.error('❌ Error getting counselor note by ID:', error);
      return null;
    }
  }

  /**
   * Create assignment for student
   */
  static async createStudentAssignment(
    counselorId: number,
    studentId: number,
    assignmentData: {
      assignmentType: 'assessment' | 'career_research' | 'skill_development' | 'course_planning';
      title: string;
      description: string;
      dueDate?: string;
    }
  ): Promise<StudentAssignment> {
    try {
      // Verify access
      const hasAccess = await RelationshipService.hasPermission(counselorId, studentId);
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      const result = await DatabaseAdapter.run(`
        INSERT INTO student_assignments (
          counselor_id, student_id, assignment_type, title, description, due_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'assigned')
      `, [
        counselorId,
        studentId,
        assignmentData.assignmentType,
        assignmentData.title,
        assignmentData.description,
        assignmentData.dueDate || null
      ]);

      const assignmentId = result.lastID;
      if (!assignmentId) {
        throw new Error('Failed to create assignment');
      }

      const assignment = await this.getStudentAssignmentById(assignmentId);
      if (!assignment) {
        throw new Error('Failed to retrieve created assignment');
      }

      console.log(`✅ Created assignment for student ${studentId}`);
      return assignment;
    } catch (error) {
      console.error('❌ Error creating student assignment:', error);
      throw error;
    }
  }

  /**
   * Get assignments for a student
   */
  static async getStudentAssignments(counselorId: number, studentId: number): Promise<StudentAssignment[]> {
    try {
      const assignments = await DatabaseAdapter.all<StudentAssignment>(`
        SELECT * FROM student_assignments 
        WHERE counselor_id = ? AND student_id = ?
        ORDER BY created_at DESC
      `, [counselorId, studentId]);

      return assignments;
    } catch (error) {
      console.error('❌ Error getting student assignments:', error);
      return [];
    }
  }

  /**
   * Get assignment by ID
   */
  static async getStudentAssignmentById(assignmentId: number): Promise<StudentAssignment | null> {
    try {
      const assignment = await DatabaseAdapter.get<StudentAssignment>(`
        SELECT * FROM student_assignments WHERE id = ?
      `, [assignmentId]);

      return assignment || null;
    } catch (error) {
      console.error('❌ Error getting assignment by ID:', error);
      return null;
    }
  }

  /**
   * Update assignment status
   */
  static async updateAssignmentStatus(
    assignmentId: number,
    status: 'assigned' | 'in_progress' | 'completed' | 'overdue'
  ): Promise<StudentAssignment | null> {
    try {
      await DatabaseAdapter.run(`
        UPDATE student_assignments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `, [status, assignmentId]);

      return this.getStudentAssignmentById(assignmentId);
    } catch (error) {
      console.error('❌ Error updating assignment status:', error);
      throw error;
    }
  }

  /**
   * Get counselor dashboard statistics
   */
  static async getCounselorStats(counselorId: number): Promise<any> {
    try {
      const students = await RelationshipService.getStudentsForCounselor(counselorId);
      const totalStudents = students.length;

      // Count students with completed assessments
      let studentsWithAssessments = 0;
      let studentsWithCareerPlans = 0;
      let totalAssignments = 0;
      let completedAssignments = 0;

      for (const student of students) {
        const studentId = parseInt(student.id);
        
        const assessmentSessions = await AssessmentServiceDB.getUserSessions(studentId);
        if (assessmentSessions.length > 0) {
          studentsWithAssessments++;
        }

        const careerRecommendations = await CareerPlanService.getUserCareerRecommendations(studentId);
        if (careerRecommendations.length > 0) {
          studentsWithCareerPlans++;
        }

        const assignments = await this.getStudentAssignments(counselorId, studentId);
        totalAssignments += assignments.length;
        completedAssignments += assignments.filter(a => a.status === 'completed').length;
      }

      return {
        totalStudents,
        studentsWithAssessments,
        studentsWithCareerPlans,
        totalAssignments,
        completedAssignments,
        assessmentCompletionRate: totalStudents > 0 ? Math.round((studentsWithAssessments / totalStudents) * 100) : 0,
        careerPlanCompletionRate: totalStudents > 0 ? Math.round((studentsWithCareerPlans / totalStudents) * 100) : 0,
        assignmentCompletionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Error getting counselor stats:', error);
      return {
        totalStudents: 0,
        studentsWithAssessments: 0,
        studentsWithCareerPlans: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        assessmentCompletionRate: 0,
        careerPlanCompletionRate: 0,
        assignmentCompletionRate: 0
      };
    }
  }
}