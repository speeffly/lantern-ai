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
      const notes = await this.getCounselorNotesForStudent(counselorId, studentId).catch((error) => {
        console.error('❌ Error getting counselor notes:', error);
        if (error.message && error.message.includes('constraint')) {
          console.error('🔍 Constraint error in getCounselorNotesForStudent');
        }
        // Return empty array instead of failing the entire page load
        return [];
      });
      const assignments = await this.getStudentAssignments(counselorId, studentId).catch((error) => {
        console.error('❌ Error getting student assignments:', error);
        // Return empty array instead of failing the entire page load
        return [];
      });

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
   * Validate note_type value against PostgreSQL constraint
   */
  private static validateNoteType(noteType: string): void {
    const validNoteTypes = ['general', 'career_guidance', 'academic', 'personal', 'parent_communication'];
    
    if (!noteType || typeof noteType !== 'string') {
      throw new Error(`Invalid note_type: must be a non-empty string. Received: ${typeof noteType}`);
    }
    
    // Trim whitespace and check for exact match
    const trimmedNoteType = noteType.trim();
    if (!validNoteTypes.includes(trimmedNoteType)) {
      throw new Error(`Invalid note_type: "${trimmedNoteType}". Must be exactly one of: ${validNoteTypes.join(', ')}`);
    }
    
    // Check for hidden characters or encoding issues
    if (trimmedNoteType !== noteType) {
      console.warn(`⚠️ Note type had whitespace: "${noteType}" -> "${trimmedNoteType}"`);
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
      // Validate note_type with comprehensive checking
      this.validateNoteType(noteData.noteType);
      
      // Verify access
      const hasAccess = await RelationshipService.hasPermission(counselorId, studentId);
      if (!hasAccess) {
        throw new Error('Access denied');
      }
      
      // Verify both users exist and have correct roles
      const student = await DatabaseAdapter.get(`
        SELECT id, role FROM users WHERE id = ? AND role = 'student'
      `, [studentId]);
      
      const counselor = await DatabaseAdapter.get(`
        SELECT id, role FROM users WHERE id = ? AND role = 'counselor'
      `, [counselorId]);
      
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found or not a student`);
      }
      
      if (!counselor) {
        throw new Error(`Counselor with ID ${counselorId} not found or not a counselor`);
      }

      // Debug: Log the exact values being inserted
      console.log('🔍 DEBUG - CounselorService.createCounselorNote params:', {
        studentId,
        counselorId,
        noteData,
        noteType: noteData.noteType,
        noteTypeType: typeof noteData.noteType
      });

      // Use trimmed note_type to prevent whitespace issues
      const trimmedNoteType = noteData.noteType.trim();
      
      const result = await DatabaseAdapter.run(`
        INSERT INTO counselor_notes (
          student_id, counselor_id, note_type, title, content, is_shared_with_parent
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        counselorId,
        trimmedNoteType,
        noteData.title.trim(),
        noteData.content.trim(),
        noteData.isSharedWithParent ? true : false
      ]).catch((error) => {
        // Enhanced error handling for constraint violations
        console.error('❌ Database INSERT error:', error);
        console.error('🔍 Failed INSERT parameters:', {
          studentId,
          counselorId,
          noteType: trimmedNoteType,
          title: noteData.title,
          content: noteData.content,
          isSharedWithParent: noteData.isSharedWithParent
        });
        
        if (error.message && error.message.includes('counselor_notes_note_type_check')) {
          throw new Error(`PostgreSQL constraint violation: note_type "${trimmedNoteType}" is not allowed. Must be one of: general, career_guidance, academic, personal, parent_communication`);
        }
        
        throw error;
      });

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
      // Add validation to prevent constraint errors
      console.log(`🔍 Getting notes for student ${studentId}, counselor ${counselorId}`);
      
      // Verify both users exist and have correct roles
      const student = await DatabaseAdapter.get(`
        SELECT id, role FROM users WHERE id = ? AND role = 'student'
      `, [studentId]);
      
      const counselor = await DatabaseAdapter.get(`
        SELECT id, role FROM users WHERE id = ? AND role = 'counselor'
      `, [counselorId]);
      
      if (!student) {
        console.log(`⚠️ Student ${studentId} not found or not a student`);
        return [];
      }
      
      if (!counselor) {
        console.log(`⚠️ Counselor ${counselorId} not found or not a counselor`);
        return [];
      }
      
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

      console.log(`📊 DEBUG - Calculating stats for counselor ${counselorId}`);
      console.log(`📊 DEBUG - Total students: ${totalStudents}`);

      // Count students with completed assessments
      let studentsWithAssessments = 0;
      let studentsWithCareerPlans = 0;
      let totalAssignments = 0;
      let completedAssignments = 0;

      for (const student of students) {
        const studentId = parseInt(student.id);
        console.log(`📊 DEBUG - Checking student ${studentId} (${student.email})`);
        
        const assessmentSessions = await AssessmentServiceDB.getUserSessions(studentId);
        console.log(`📊 DEBUG - Student ${studentId} assessment sessions:`, assessmentSessions.length);
        
        // Debug: Show actual session data
        if (assessmentSessions.length > 0) {
          console.log(`📊 DEBUG - Student ${studentId} session details:`, assessmentSessions.map(s => ({
            id: s.id,
            status: s.status,
            completed_at: s.completed_at,
            started_at: s.started_at,
            session_token: s.session_token
          })));
        }
        
        // Multiple completion detection methods with enhanced debugging
        let hasCompletedAssessment = false;
        let detectionMethod = 'none';
        
        console.log(`📊 DEBUG - Student ${studentId} raw session data:`, JSON.stringify(assessmentSessions, null, 2));
        
        // Method 1: Check for completed status or completed_at timestamp
        const completedSessions = assessmentSessions.filter(session => 
          session.status === 'completed' || 
          session.status === 'complete' ||
          session.status === 'finished' ||
          session.completed_at !== null
        );
        
        console.log(`📊 DEBUG - Student ${studentId} completed sessions (method 1):`, completedSessions.length);
        
        // Method 2: Check if session has answers (indicates completion)
        let sessionsWithAnswers = 0;
        for (const session of assessmentSessions) {
          try {
            const answers = await DatabaseAdapter.all(`
              SELECT COUNT(*) as count FROM assessment_answers 
              WHERE session_id = ?
            `, [session.id]);
            
            const answerCount = answers[0]?.count || 0;
            if (answerCount > 0) {
              sessionsWithAnswers++;
              console.log(`📊 DEBUG - Student ${studentId} session ${session.id} has ${answerCount} answers`);
            } else {
              console.log(`📊 DEBUG - Student ${studentId} session ${session.id} has 0 answers`);
            }
          } catch (error) {
            console.log(`📊 DEBUG - Error checking answers for session ${session.id}:`, (error as Error).message);
          }
        }
        
        console.log(`📊 DEBUG - Student ${studentId} sessions with answers (method 2):`, sessionsWithAnswers);
        
        // Method 3: Check for career recommendations (indicates completed assessment)
        const studentCareerRecommendations = await CareerPlanService.getUserCareerRecommendations(studentId);
        console.log(`📊 DEBUG - Student ${studentId} career recommendations (method 3):`, studentCareerRecommendations.length);
        
        // Method 4: Check for any assessment data in user profile or other tables
        let hasAssessmentData = false;
        try {
          const profileData = await UserService.getStudentProfile(studentId);
          if (profileData && (profileData.interests || profileData.skills || profileData.career_preferences)) {
            hasAssessmentData = true;
            console.log(`📊 DEBUG - Student ${studentId} has profile assessment data (method 4) ✅`);
          }
        } catch (error) {
          console.log(`📊 DEBUG - Error checking profile data for student ${studentId}:`, (error as Error).message);
        }
        
        // Determine completion using multiple methods
        if (completedSessions.length > 0) {
          hasCompletedAssessment = true;
          detectionMethod = 'status/timestamp';
          console.log(`📊 DEBUG - Student ${studentId} completion method: status/timestamp ✅`);
        } else if (sessionsWithAnswers > 0) {
          hasCompletedAssessment = true;
          detectionMethod = 'has answers';
          console.log(`📊 DEBUG - Student ${studentId} completion method: has answers ✅`);
        } else if (studentCareerRecommendations.length > 0) {
          hasCompletedAssessment = true;
          detectionMethod = 'has career recommendations';
          console.log(`📊 DEBUG - Student ${studentId} completion method: has career recommendations ✅`);
        } else if (hasAssessmentData) {
          hasCompletedAssessment = true;
          detectionMethod = 'has profile data';
          console.log(`📊 DEBUG - Student ${studentId} completion method: has profile data ✅`);
        } else if (assessmentSessions.length > 0) {
          // More conservative fallback - only if session looks substantial
          const substantialSessions = assessmentSessions.filter(session => 
            session.started_at && 
            (new Date(session.started_at).getTime() < Date.now() - 60000) // At least 1 minute old
          );
          if (substantialSessions.length > 0) {
            hasCompletedAssessment = true;
            detectionMethod = 'fallback (substantial sessions)';
            console.log(`📊 DEBUG - Student ${studentId} completion method: fallback (substantial sessions) ✅`);
          } else {
            console.log(`📊 DEBUG - Student ${studentId} has sessions but they appear incomplete ❌`);
          }
        } else {
          console.log(`📊 DEBUG - Student ${studentId} no assessment data found by any method ❌`);
        }
        
        if (hasCompletedAssessment) {
          studentsWithAssessments++;
          console.log(`📊 DEBUG - Student ${studentId} counted as completed (${detectionMethod}) ✅`);
        } else {
          console.log(`📊 DEBUG - Student ${studentId} no completed assessment found ❌`);
        }

        const careerRecommendations = await CareerPlanService.getUserCareerRecommendations(studentId);
        console.log(`📊 DEBUG - Student ${studentId} career recommendations:`, careerRecommendations.length);
        
        // Debug: Show actual career recommendation data
        if (careerRecommendations.length > 0) {
          console.log(`📊 DEBUG - Student ${studentId} career rec details:`, careerRecommendations.map(r => ({
            id: r.id,
            generated_at: r.generated_at,
            career_matches: r.career_matches ? 'present' : 'missing'
          })));
          studentsWithCareerPlans++;
          console.log(`📊 DEBUG - Student ${studentId} has career plans ✅`);
        } else {
          console.log(`📊 DEBUG - Student ${studentId} no career recommendations found ❌`);
        }

        const assignments = await this.getStudentAssignments(counselorId, studentId);
        console.log(`📊 DEBUG - Student ${studentId} assignments:`, assignments.length);
        totalAssignments += assignments.length;
        const completedCount = assignments.filter(a => a.status === 'completed').length;
        completedAssignments += completedCount;
        console.log(`📊 DEBUG - Student ${studentId} completed assignments: ${completedCount}/${assignments.length}`);
      }

      const assessmentCompletionRate = totalStudents > 0 ? Math.round((studentsWithAssessments / totalStudents) * 100) : 0;
      const careerPlanCompletionRate = totalStudents > 0 ? Math.round((studentsWithCareerPlans / totalStudents) * 100) : 0;
      const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

      console.log(`📊 DEBUG - Final calculations:`);
      console.log(`📊 DEBUG - Assessment completion: ${studentsWithAssessments}/${totalStudents} = ${assessmentCompletionRate}%`);
      console.log(`📊 DEBUG - Career plan completion: ${studentsWithCareerPlans}/${totalStudents} = ${careerPlanCompletionRate}%`);
      console.log(`📊 DEBUG - Assignment completion: ${completedAssignments}/${totalAssignments} = ${assignmentCompletionRate}%`);

      return {
        totalStudents,
        studentsWithAssessments,
        studentsWithCareerPlans,
        totalAssignments,
        completedAssignments,
        assessmentCompletionRate,
        careerPlanCompletionRate,
        assignmentCompletionRate
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