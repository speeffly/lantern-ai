import { DatabaseAdapter } from './databaseAdapter';

export interface RecommendationFeedback {
  id?: number;
  userId?: number;
  sessionId?: number;
  recommendationId?: number;
  careerCode: string;
  careerTitle: string;
  feedbackType: 'helpful' | 'not_helpful' | 'rating' | 'comment';
  rating?: number;
  isHelpful?: boolean;
  comment?: string;
  improvementSuggestions?: string;
  createdAt?: Date;
}

export interface AILearningData {
  id?: number;
  userProfile: string;
  originalRecommendation: string;
  feedbackSummary: string;
  improvementNotes?: string;
  feedbackScore?: number;
  createdAt?: Date;
}

export class FeedbackService {
  /**
   * Submit feedback for a career recommendation
   */
  static async submitFeedback(feedback: RecommendationFeedback): Promise<number> {
    try {
      console.log('📝 Submitting recommendation feedback:', {
        careerTitle: feedback.careerTitle,
        feedbackType: feedback.feedbackType,
        rating: feedback.rating,
        isHelpful: feedback.isHelpful
      });

      const result = await DatabaseAdapter.run(`
        INSERT INTO recommendation_feedback (
          user_id, session_id, recommendation_id, career_code, career_title,
          feedback_type, rating, is_helpful, comment, improvement_suggestions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        feedback.userId || null,
        feedback.sessionId || null,
        feedback.recommendationId || null,
        feedback.careerCode,
        feedback.careerTitle,
        feedback.feedbackType,
        feedback.rating || null,
        feedback.isHelpful || null,
        feedback.comment || null,
        feedback.improvementSuggestions || null
      ]);

      const feedbackId = result.insertId || result.lastID;
      console.log('✅ Feedback submitted successfully, ID:', feedbackId);

      // Process feedback for AI learning
      await this.processFeedbackForLearning(feedback, feedbackId);

      return feedbackId;
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback for a specific career or recommendation
   */
  static async getFeedback(careerCode?: string, recommendationId?: number): Promise<RecommendationFeedback[]> {
    try {
      let query = 'SELECT * FROM recommendation_feedback WHERE 1=1';
      const params: any[] = [];

      if (careerCode) {
        query += ' AND career_code = $' + (params.length + 1);
        params.push(careerCode);
      }

      if (recommendationId) {
        query += ' AND recommendation_id = $' + (params.length + 1);
        params.push(recommendationId);
      }

      query += ' ORDER BY created_at DESC';

      const feedback = await DatabaseAdapter.all<RecommendationFeedback>(query, params);
      console.log(`📊 Retrieved ${feedback.length} feedback entries`);

      return feedback;
    } catch (error) {
      console.error('❌ Error retrieving feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback statistics for analytics
   */
  static async getFeedbackStats(): Promise<any> {
    try {
      const stats = await DatabaseAdapter.all(`
        SELECT 
          career_code,
          career_title,
          COUNT(*) as total_feedback,
          AVG(CASE WHEN rating IS NOT NULL THEN rating END) as avg_rating,
          COUNT(CASE WHEN is_helpful = true THEN 1 END) as helpful_count,
          COUNT(CASE WHEN is_helpful = false THEN 1 END) as not_helpful_count,
          COUNT(CASE WHEN comment IS NOT NULL AND comment != '' THEN 1 END) as comment_count
        FROM recommendation_feedback 
        GROUP BY career_code, career_title
        ORDER BY total_feedback DESC
      `);

      console.log(`📈 Generated feedback stats for ${stats.length} careers`);
      return stats;
    } catch (error) {
      console.error('❌ Error generating feedback stats:', error);
      throw error;
    }
  }

  /**
   * Process feedback for AI learning and improvement
   */
  private static async processFeedbackForLearning(
    feedback: RecommendationFeedback, 
    feedbackId: number
  ): Promise<void> {
    try {
      // Calculate feedback score
      let feedbackScore = 0;
      if (feedback.rating) {
        feedbackScore = feedback.rating / 5.0; // Normalize to 0-1
      } else if (feedback.isHelpful !== undefined) {
        feedbackScore = feedback.isHelpful ? 1.0 : 0.0;
      }

      // Create learning data entry
      const learningData: AILearningData = {
        userProfile: JSON.stringify({
          careerCode: feedback.careerCode,
          careerTitle: feedback.careerTitle,
          feedbackType: feedback.feedbackType
        }),
        originalRecommendation: feedback.careerTitle,
        feedbackSummary: JSON.stringify({
          rating: feedback.rating,
          isHelpful: feedback.isHelpful,
          comment: feedback.comment,
          suggestions: feedback.improvementSuggestions
        }),
        improvementNotes: feedback.improvementSuggestions,
        feedbackScore: feedbackScore
      };

      await DatabaseAdapter.run(`
        INSERT INTO ai_learning_data (
          user_profile, original_recommendation, feedback_summary,
          improvement_notes, feedback_score
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        learningData.userProfile,
        learningData.originalRecommendation,
        learningData.feedbackSummary,
        learningData.improvementNotes,
        learningData.feedbackScore
      ]);

      console.log('🧠 AI learning data created for feedback ID:', feedbackId);
    } catch (error) {
      console.error('❌ Error processing feedback for learning:', error);
      // Don't throw - feedback submission should still succeed
    }
  }

  /**
   * Get AI learning insights for improving recommendations
   */
  static async getAILearningInsights(): Promise<any> {
    try {
      const insights = await DatabaseAdapter.all(`
        SELECT 
          original_recommendation,
          AVG(feedback_score) as avg_score,
          COUNT(*) as feedback_count,
          STRING_AGG(improvement_notes, '; ') as common_suggestions
        FROM ai_learning_data 
        WHERE improvement_notes IS NOT NULL
        GROUP BY original_recommendation
        HAVING COUNT(*) >= 3
        ORDER BY avg_score ASC, feedback_count DESC
      `);

      console.log(`🧠 Generated AI learning insights for ${insights.length} recommendations`);
      return insights;
    } catch (error) {
      console.error('❌ Error generating AI learning insights:', error);
      return [];
    }
  }

  /**
   * Get feedback trends over time
   */
  static async getFeedbackTrends(days: number = 30): Promise<any> {
    try {
      const trends = await DatabaseAdapter.all(`
        SELECT 
          DATE(created_at) as feedback_date,
          COUNT(*) as total_feedback,
          AVG(CASE WHEN rating IS NOT NULL THEN rating END) as avg_rating,
          COUNT(CASE WHEN is_helpful = true THEN 1 END) as helpful_count,
          COUNT(CASE WHEN is_helpful = false THEN 1 END) as not_helpful_count
        FROM recommendation_feedback 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY feedback_date DESC
      `);

      console.log(`📊 Generated feedback trends for last ${days} days`);
      return trends;
    } catch (error) {
      console.error('❌ Error generating feedback trends:', error);
      return [];
    }
  }

  /**
   * Get user-specific feedback history
   */
  static async getUserFeedbackHistory(userId: number): Promise<RecommendationFeedback[]> {
    try {
      const history = await DatabaseAdapter.all<RecommendationFeedback>(`
        SELECT * FROM recommendation_feedback 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);

      console.log(`👤 Retrieved feedback history for user ${userId}: ${history.length} entries`);
      return history;
    } catch (error) {
      console.error('❌ Error retrieving user feedback history:', error);
      throw error;
    }
  }

  /**
   * Update AI recommendations based on feedback patterns
   */
  static async getRecommendationImprovements(careerCode: string): Promise<string[]> {
    try {
      const improvements = await DatabaseAdapter.all(`
        SELECT improvement_notes, feedback_score
        FROM ai_learning_data 
        WHERE original_recommendation LIKE '%${careerCode}%'
        AND improvement_notes IS NOT NULL
        AND feedback_score < 0.7
        ORDER BY feedback_score ASC
        LIMIT 10
      `);

      const suggestions = improvements
        .map(item => item.improvement_notes)
        .filter(note => note && note.trim().length > 0);

      console.log(`💡 Found ${suggestions.length} improvement suggestions for ${careerCode}`);
      return suggestions;
    } catch (error) {
      console.error('❌ Error getting recommendation improvements:', error);
      return [];
    }
  }
}