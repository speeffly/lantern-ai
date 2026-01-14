import { DatabaseAdapter } from './databaseAdapter';
import { CareerMatch, AIRecommendations } from '../types';

export interface CareerRecommendationRecord {
  id: number;
  session_id?: number;
  user_id?: number;
  career_matches: CareerMatch[];
  ai_recommendations?: AIRecommendations;
  full_recommendations?: any; // Complete recommendations object from assessment
  local_job_market?: any;
  academic_plan?: any;
  generated_at: string;
}

export interface ActionPlan {
  id: number;
  user_id: number;
  career_code: string;
  career_title: string;
  short_term_goals: string[];
  medium_term_goals: string[];
  long_term_goals: string[];
  skill_gaps: any[];
  action_items: any[];
  progress_notes: any[];
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CounselorNote {
  id: number;
  counselor_id: number;
  student_id: number;
  note_type: 'general' | 'career_guidance' | 'academic' | 'personal' | 'parent_communication';
  title: string;
  content: string;
  is_shared_with_parent: boolean;
  is_shared_with_student: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProgress {
  id: number;
  student_id: number;
  action_plan_id?: number;
  milestone_type: string;
  milestone_description: string;
  target_date?: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  notes?: string;
  recorded_by?: number;
  created_at: string;
  updated_at: string;
}

export class CareerPlanService {
  /**
   * Save career recommendations
   */
  static async saveCareerRecommendations(
    sessionId: number | null,
    userId: number | null,
    careerMatches: CareerMatch[],
    aiRecommendations?: AIRecommendations,
    localJobMarket?: any,
    academicPlan?: any,
    fullRecommendations?: any
  ): Promise<CareerRecommendationRecord> {
    try {
      const result = await DatabaseAdapter.run(`
        INSERT INTO career_recommendations (
          session_id, user_id, career_matches, ai_recommendations, 
          local_job_market, academic_plan, full_recommendations
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        sessionId,
        userId,
        JSON.stringify(careerMatches),
        aiRecommendations ? JSON.stringify(aiRecommendations) : null,
        localJobMarket ? JSON.stringify(localJobMarket) : null,
        academicPlan ? JSON.stringify(academicPlan) : null,
        fullRecommendations ? JSON.stringify(fullRecommendations) : null
      ]);

      const recommendationId = result.lastID;
      if (!recommendationId) {
        throw new Error('Failed to save career recommendations');
      }

      const recommendation = await this.getCareerRecommendationById(recommendationId);
      if (!recommendation) {
        throw new Error('Failed to retrieve saved recommendations');
      }

      console.log('✅ Saved career recommendations:', recommendationId);
      return recommendation;
    } catch (error) {
      console.error('❌ Error saving career recommendations:', error);
      throw error;
    }
  }

  /**
   * Get career recommendation by ID
   */
  static async getCareerRecommendationById(id: number): Promise<CareerRecommendationRecord | null> {
    try {
      const record = await DatabaseAdapter.get<any>(`
        SELECT * FROM career_recommendations WHERE id = ?
      `, [id]);

      if (!record) {
        return null;
      }

      return {
        ...record,
        career_matches: JSON.parse(record.career_matches),
        ai_recommendations: record.ai_recommendations ? JSON.parse(record.ai_recommendations) : null,
        local_job_market: record.local_job_market ? JSON.parse(record.local_job_market) : null,
        academic_plan: record.academic_plan ? JSON.parse(record.academic_plan) : null,
        full_recommendations: record.full_recommendations ? JSON.parse(record.full_recommendations) : null
      };
    } catch (error) {
      console.error('❌ Error getting career recommendation:', error);
      return null;
    }
  }

  /**
   * Get user's career recommendations
   */
  static async getUserCareerRecommendations(userId: number): Promise<CareerRecommendationRecord[]> {
    try {
      const records = await DatabaseAdapter.all<any>(`
        SELECT * FROM career_recommendations 
        WHERE user_id = ? 
        ORDER BY generated_at DESC
      `, [userId]);

      return records.map(record => ({
        ...record,
        career_matches: JSON.parse(record.career_matches),
        ai_recommendations: record.ai_recommendations ? JSON.parse(record.ai_recommendations) : null,
        local_job_market: record.local_job_market ? JSON.parse(record.local_job_market) : null,
        academic_plan: record.academic_plan ? JSON.parse(record.academic_plan) : null,
        full_recommendations: record.full_recommendations ? JSON.parse(record.full_recommendations) : null
      }));
    } catch (error) {
      console.error('❌ Error getting user career recommendations:', error);
      return [];
    }
  }

  /**
   * Create action plan
   */
  static async createActionPlan(
    userId: number,
    careerCode: string,
    careerTitle: string,
    shortTermGoals: string[],
    mediumTermGoals: string[],
    longTermGoals: string[],
    skillGaps: any[],
    actionItems: any[],
    createdBy?: number
  ): Promise<ActionPlan> {
    try {
      const result = await DatabaseAdapter.run(`
        INSERT INTO action_plans (
          user_id, career_code, career_title, short_term_goals, 
          medium_term_goals, long_term_goals, skill_gaps, action_items, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        careerCode,
        careerTitle,
        JSON.stringify(shortTermGoals),
        JSON.stringify(mediumTermGoals),
        JSON.stringify(longTermGoals),
        JSON.stringify(skillGaps),
        JSON.stringify(actionItems),
        createdBy || null
      ]);

      const actionPlanId = result.lastID;
      if (!actionPlanId) {
        throw new Error('Failed to create action plan');
      }

      const actionPlan = await this.getActionPlanById(actionPlanId);
      if (!actionPlan) {
        throw new Error('Failed to retrieve created action plan');
      }

      console.log('✅ Created action plan:', actionPlanId);
      return actionPlan;
    } catch (error) {
      console.error('❌ Error creating action plan:', error);
      throw error;
    }
  }

  /**
   * Get action plan by ID
   */
  static async getActionPlanById(id: number): Promise<ActionPlan | null> {
    try {
      const plan = await DatabaseAdapter.get<any>(`
        SELECT * FROM action_plans WHERE id = ?
      `, [id]);

      if (!plan) {
        return null;
      }

      return {
        ...plan,
        short_term_goals: JSON.parse(plan.short_term_goals),
        medium_term_goals: JSON.parse(plan.medium_term_goals),
        long_term_goals: JSON.parse(plan.long_term_goals),
        skill_gaps: JSON.parse(plan.skill_gaps),
        action_items: JSON.parse(plan.action_items),
        progress_notes: JSON.parse(plan.progress_notes || '[]')
      };
    } catch (error) {
      console.error('❌ Error getting action plan:', error);
      return null;
    }
  }

  /**
   * Get user's action plans
   */
  static async getUserActionPlans(userId: number): Promise<ActionPlan[]> {
    try {
      const plans = await DatabaseAdapter.all<any>(`
        SELECT * FROM action_plans 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [userId]);

      return plans.map(plan => ({
        ...plan,
        short_term_goals: JSON.parse(plan.short_term_goals),
        medium_term_goals: JSON.parse(plan.medium_term_goals),
        long_term_goals: JSON.parse(plan.long_term_goals),
        skill_gaps: JSON.parse(plan.skill_gaps),
        action_items: JSON.parse(plan.action_items),
        progress_notes: JSON.parse(plan.progress_notes || '[]')
      }));
    } catch (error) {
      console.error('❌ Error getting user action plans:', error);
      return [];
    }
  }

  /**
   * Update action plan progress
   */
  static async updateActionPlanProgress(
    actionPlanId: number,
    progressNote: string,
    updatedBy?: number
  ): Promise<boolean> {
    try {
      const plan = await this.getActionPlanById(actionPlanId);
      if (!plan) {
        throw new Error('Action plan not found');
      }

      const progressNotes = [...plan.progress_notes, {
        note: progressNote,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      }];

      await DatabaseAdapter.run(`
        UPDATE action_plans 
        SET progress_notes = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [JSON.stringify(progressNotes), actionPlanId]);

      console.log('✅ Updated action plan progress:', actionPlanId);
      return true;
    } catch (error) {
      console.error('❌ Error updating action plan progress:', error);
      return false;
    }
  }

  /**
   * Create counselor note
   */
  static async createCounselorNote(
    counselorId: number,
    studentId: number,
    noteType: 'general' | 'career_guidance' | 'academic' | 'personal' | 'parent_communication',
    title: string,
    content: string,
    isSharedWithParent: boolean = false,
    isSharedWithStudent: boolean = true
  ): Promise<CounselorNote> {
    try {
      // Validate note_type against allowed values
      const validNoteTypes = ['general', 'career_guidance', 'academic', 'personal', 'parent_communication'];
      if (!validNoteTypes.includes(noteType)) {
        throw new Error(`Invalid note_type: "${noteType}". Must be one of: ${validNoteTypes.join(', ')}`);
      }

      const result = await DatabaseAdapter.run(`
        INSERT INTO counselor_notes (
          counselor_id, student_id, note_type, title, content, 
          is_shared_with_parent, is_shared_with_student
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        counselorId,
        studentId,
        noteType,
        title,
        content,
        isSharedWithParent ? 1 : 0,
        isSharedWithStudent ? 1 : 0
      ]);

      const noteId = result.lastID;
      if (!noteId) {
        throw new Error('Failed to create counselor note');
      }

      const note = await this.getCounselorNoteById(noteId);
      if (!note) {
        throw new Error('Failed to retrieve created note');
      }

      console.log('✅ Created counselor note:', noteId);
      return note;
    } catch (error) {
      console.error('❌ Error creating counselor note:', error);
      throw error;
    }
  }

  /**
   * Get counselor note by ID
   */
  static async getCounselorNoteById(id: number): Promise<CounselorNote | null> {
    try {
      const note = await DatabaseAdapter.get<CounselorNote>(`
        SELECT * FROM counselor_notes WHERE id = ?
      `, [id]);

      return note || null;
    } catch (error) {
      console.error('❌ Error getting counselor note:', error);
      return null;
    }
  }

  /**
   * Get counselor notes for a student
   */
  static async getCounselorNotesForStudent(
    studentId: number,
    viewerRole: 'student' | 'parent' | 'counselor',
    viewerId?: number
  ): Promise<CounselorNote[]> {
    try {
      let whereClause = 'WHERE student_id = ?';
      const params: any[] = [studentId];

      // Filter based on viewer role and sharing settings
      if (viewerRole === 'student') {
        whereClause += ' AND is_shared_with_student = 1';
      } else if (viewerRole === 'parent') {
        whereClause += ' AND is_shared_with_parent = 1';
      } else if (viewerRole === 'counselor' && viewerId) {
        whereClause += ' AND counselor_id = ?';
        params.push(viewerId);
      }

      const notes = await DatabaseAdapter.all<CounselorNote>(`
        SELECT * FROM counselor_notes 
        ${whereClause}
        ORDER BY created_at DESC
      `, params);

      return notes;
    } catch (error) {
      console.error('❌ Error getting counselor notes for student:', error);
      return [];
    }
  }

  /**
   * Record student progress
   */
  static async recordStudentProgress(
    studentId: number,
    milestoneType: string,
    milestoneDescription: string,
    status: 'pending' | 'in_progress' | 'completed' | 'skipped',
    actionPlanId?: number,
    targetDate?: string,
    completionDate?: string,
    notes?: string,
    recordedBy?: number
  ): Promise<StudentProgress> {
    try {
      const result = await DatabaseAdapter.run(`
        INSERT INTO student_progress (
          student_id, action_plan_id, milestone_type, milestone_description,
          target_date, completion_date, status, notes, recorded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        actionPlanId || null,
        milestoneType,
        milestoneDescription,
        targetDate || null,
        completionDate || null,
        status,
        notes || null,
        recordedBy || null
      ]);

      const progressId = result.lastID;
      if (!progressId) {
        throw new Error('Failed to record student progress');
      }

      const progress = await this.getStudentProgressById(progressId);
      if (!progress) {
        throw new Error('Failed to retrieve recorded progress');
      }

      console.log('✅ Recorded student progress:', progressId);
      return progress;
    } catch (error) {
      console.error('❌ Error recording student progress:', error);
      throw error;
    }
  }

  /**
   * Get student progress by ID
   */
  static async getStudentProgressById(id: number): Promise<StudentProgress | null> {
    try {
      const progress = await DatabaseAdapter.get<StudentProgress>(`
        SELECT * FROM student_progress WHERE id = ?
      `, [id]);

      return progress || null;
    } catch (error) {
      console.error('❌ Error getting student progress:', error);
      return null;
    }
  }

  /**
   * Get student progress records
   */
  static async getStudentProgress(studentId: number): Promise<StudentProgress[]> {
    try {
      const progress = await DatabaseAdapter.all<StudentProgress>(`
        SELECT * FROM student_progress 
        WHERE student_id = ? 
        ORDER BY created_at DESC
      `, [studentId]);

      return progress;
    } catch (error) {
      console.error('❌ Error getting student progress records:', error);
      return [];
    }
  }
}