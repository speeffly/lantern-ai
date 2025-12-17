import { DatabaseAdapter } from './databaseAdapter';
import { AssessmentAnswer, StudentProfile } from '../types';
import { randomUUID } from 'crypto';

export interface AssessmentSession {
  id: number;
  user_id?: number;
  session_token: string;
  zip_code?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  expires_at: string;
}

export interface AssessmentAnswerDB {
  id: number;
  session_id: number;
  question_id: string;
  answer: string;
  answered_at: string;
}

export class AssessmentServiceDB {
  /**
   * Create a new assessment session
   */
  static async createSession(userId?: number): Promise<AssessmentSession> {
    try {
      const sessionToken = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const result = await DatabaseAdapter.run(`
        INSERT INTO assessment_sessions (user_id, session_token, expires_at)
        VALUES (?, ?, ?)
      `, [userId || null, sessionToken, expiresAt.toISOString()]);

      const sessionId = result.lastID;
      if (!sessionId) {
        throw new Error('Failed to create assessment session');
      }

      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new Error('Failed to retrieve created session');
      }

      console.log('✅ Created assessment session:', sessionToken);
      return session;
    } catch (error) {
      console.error('❌ Error creating assessment session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: number): Promise<AssessmentSession | null> {
    try {
      const session = await DatabaseAdapter.get<AssessmentSession>(`
        SELECT * FROM assessment_sessions WHERE id = ?
      `, [sessionId]);

      return session || null;
    } catch (error) {
      console.error('❌ Error getting session by ID:', error);
      return null;
    }
  }

  /**
   * Get session by token
   */
  static async getSessionByToken(sessionToken: string): Promise<AssessmentSession | null> {
    try {
      const session = await DatabaseAdapter.get<AssessmentSession>(`
        SELECT * FROM assessment_sessions WHERE session_token = ?
      `, [sessionToken]);

      // Check if session is expired
      if (session && new Date(session.expires_at) < new Date()) {
        console.log('⚠️ Session expired:', sessionToken);
        return null;
      }

      return session || null;
    } catch (error) {
      console.error('❌ Error getting session by token:', error);
      return null;
    }
  }

  /**
   * Save assessment answers
   */
  static async saveAnswers(sessionToken: string, answers: AssessmentAnswer[]): Promise<boolean> {
    try {
      const session = await this.getSessionByToken(sessionToken);
      if (!session) {
        throw new Error('Session not found or expired');
      }

      // Delete existing answers for this session
      await DatabaseAdapter.run(`
        DELETE FROM assessment_answers WHERE session_id = ?
      `, [session.id]);

      // Insert new answers
      const statements = answers.map(answer => ({
        sql: `INSERT INTO assessment_answers (session_id, question_id, answer) VALUES (?, ?, ?)`,
        params: [session.id, answer.questionId, answer.answer]
      }));

      await DatabaseAdapter.transaction(statements);

      console.log(`✅ Saved ${answers.length} assessment answers for session:`, sessionToken);
      return true;
    } catch (error) {
      console.error('❌ Error saving assessment answers:', error);
      return false;
    }
  }

  /**
   * Get assessment answers for a session
   */
  static async getAnswers(sessionToken: string): Promise<AssessmentAnswer[]> {
    try {
      const session = await this.getSessionByToken(sessionToken);
      if (!session) {
        return [];
      }

      const answers = await DatabaseAdapter.all<AssessmentAnswerDB>(`
        SELECT * FROM assessment_answers 
        WHERE session_id = ? 
        ORDER BY answered_at
      `, [session.id]);

      return answers.map(answer => ({
        questionId: answer.question_id,
        answer: answer.answer,
        timestamp: new Date(answer.answered_at)
      }));
    } catch (error) {
      console.error('❌ Error getting assessment answers:', error);
      return [];
    }
  }

  /**
   * Complete assessment session
   */
  static async completeSession(sessionToken: string, zipCode: string, profileData?: Partial<StudentProfile>): Promise<boolean> {
    try {
      const session = await this.getSessionByToken(sessionToken);
      if (!session) {
        throw new Error('Session not found or expired');
      }

      // Update session status
      await DatabaseAdapter.run(`
        UPDATE assessment_sessions 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, zip_code = ?
        WHERE id = ?
      `, [zipCode, session.id]);

      // If user is logged in and profile data provided, update their profile
      if (session.user_id && profileData) {
        // This would update the student profile with assessment-derived data
        console.log('📝 Updating user profile with assessment data');
      }

      console.log('✅ Completed assessment session:', sessionToken);
      return true;
    } catch (error) {
      console.error('❌ Error completing assessment session:', error);
      return false;
    }
  }

  /**
   * Link session to user account
   */
  static async linkSessionToUser(sessionToken: string, userId: number): Promise<boolean> {
    try {
      const session = await this.getSessionByToken(sessionToken);
      if (!session) {
        throw new Error('Session not found or expired');
      }

      await DatabaseAdapter.run(`
        UPDATE assessment_sessions SET user_id = ? WHERE id = ?
      `, [userId, session.id]);

      console.log('🔗 Linked session to user:', sessionToken, '->', userId);
      return true;
    } catch (error) {
      console.error('❌ Error linking session to user:', error);
      return false;
    }
  }

  /**
   * Get user's assessment sessions
   */
  static async getUserSessions(userId: number): Promise<AssessmentSession[]> {
    try {
      const sessions = await DatabaseAdapter.all<AssessmentSession>(`
        SELECT * FROM assessment_sessions 
        WHERE user_id = ? 
        ORDER BY started_at DESC
      `, [userId]);

      return sessions;
    } catch (error) {
      console.error('❌ Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await DatabaseAdapter.run(`
        DELETE FROM assessment_sessions 
        WHERE expires_at < CURRENT_TIMESTAMP
      `);

      const deletedCount = result.changes || 0;
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired assessment sessions`);
      }

      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(): Promise<any> {
    try {
      const stats = await DatabaseAdapter.get(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_sessions,
          COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_sessions,
          COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_sessions
        FROM assessment_sessions
      `);

      return stats;
    } catch (error) {
      console.error('❌ Error getting session stats:', error);
      return null;
    }
  }
}

// Set up periodic cleanup of expired sessions
setInterval(async () => {
  await AssessmentServiceDB.cleanupExpiredSessions();
}, 60 * 60 * 1000); // Run every hour