import { DatabaseAdapter } from './databaseAdapter';
import { User } from '../types';

export interface UserRelationship {
  id: number;
  primary_user_id: number;
  secondary_user_id: number;
  relationship_type: 'parent_child' | 'counselor_student';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  created_by?: number;
}

export interface RelationshipWithUsers extends UserRelationship {
  primary_user: User;
  secondary_user: User;
}

export class RelationshipService {
  /**
   * Create a relationship between users
   */
  static async createRelationship(
    primaryUserId: number,
    secondaryUserId: number,
    relationshipType: 'parent_child' | 'counselor_student',
    createdBy?: number
  ): Promise<UserRelationship> {
    try {
      // Check if relationship already exists
      const existing = await this.getRelationship(primaryUserId, secondaryUserId, relationshipType);
      if (existing) {
        throw new Error('Relationship already exists');
      }

      const result = await DatabaseAdapter.run(`
        INSERT INTO user_relationships (primary_user_id, secondary_user_id, relationship_type, created_by)
        VALUES (?, ?, ?, ?)
      `, [primaryUserId, secondaryUserId, relationshipType, createdBy || null]);

      const relationshipId = result.lastID;
      if (!relationshipId) {
        throw new Error('Failed to create relationship');
      }

      const relationship = await this.getRelationshipById(relationshipId);
      if (!relationship) {
        throw new Error('Failed to retrieve created relationship');
      }

      console.log(`✅ Created ${relationshipType} relationship:`, primaryUserId, '->', secondaryUserId);
      return relationship;
    } catch (error) {
      console.error('❌ Error creating relationship:', error);
      throw error;
    }
  }

  /**
   * Get relationship by ID
   */
  static async getRelationshipById(relationshipId: number): Promise<UserRelationship | null> {
    try {
      const relationship = await DatabaseAdapter.get<UserRelationship>(`
        SELECT * FROM user_relationships WHERE id = ?
      `, [relationshipId]);

      return relationship || null;
    } catch (error) {
      console.error('❌ Error getting relationship by ID:', error);
      return null;
    }
  }

  /**
   * Get specific relationship between two users
   */
  static async getRelationship(
    primaryUserId: number,
    secondaryUserId: number,
    relationshipType: 'parent_child' | 'counselor_student'
  ): Promise<UserRelationship | null> {
    try {
      const relationship = await DatabaseAdapter.get<UserRelationship>(`
        SELECT * FROM user_relationships 
        WHERE primary_user_id = ? AND secondary_user_id = ? AND relationship_type = ?
      `, [primaryUserId, secondaryUserId, relationshipType]);

      return relationship || null;
    } catch (error) {
      console.error('❌ Error getting relationship:', error);
      return null;
    }
  }

  /**
   * Get all students for a counselor
   */
  static async getStudentsForCounselor(counselorId: number): Promise<User[]> {
    try {
      const students = await DatabaseAdapter.all<User>(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.created_at, u.updated_at, u.is_active
        FROM users u
        INNER JOIN user_relationships ur ON u.id = ur.secondary_user_id
        WHERE ur.primary_user_id = ? 
          AND ur.relationship_type = 'counselor_student' 
          AND ur.status = 'active'
          AND u.is_active = 1
        ORDER BY u.first_name, u.last_name
      `, [counselorId]);

      return students;
    } catch (error) {
      console.error('❌ Error getting students for counselor:', error);
      return [];
    }
  }

  /**
   * Get all children for a parent
   */
  static async getChildrenForParent(parentId: number): Promise<User[]> {
    try {
      const children = await DatabaseAdapter.all<User>(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.created_at, u.updated_at, u.is_active
        FROM users u
        INNER JOIN user_relationships ur ON u.id = ur.secondary_user_id
        WHERE ur.primary_user_id = ? 
          AND ur.relationship_type = 'parent_child' 
          AND ur.status = 'active'
          AND u.is_active = 1
        ORDER BY u.first_name, u.last_name
      `, [parentId]);

      return children;
    } catch (error) {
      console.error('❌ Error getting children for parent:', error);
      return [];
    }
  }

  /**
   * Get counselor for a student
   */
  static async getCounselorForStudent(studentId: number): Promise<User | null> {
    try {
      const counselor = await DatabaseAdapter.get<User>(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.created_at, u.updated_at, u.is_active
        FROM users u
        INNER JOIN user_relationships ur ON u.id = ur.primary_user_id
        WHERE ur.secondary_user_id = ? 
          AND ur.relationship_type = 'counselor_student' 
          AND ur.status = 'active'
          AND u.is_active = 1
      `, [studentId]);

      return counselor || null;
    } catch (error) {
      console.error('❌ Error getting counselor for student:', error);
      return null;
    }
  }

  /**
   * Get parents for a student
   */
  static async getParentsForStudent(studentId: number): Promise<User[]> {
    try {
      const parents = await DatabaseAdapter.all<User>(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.created_at, u.updated_at, u.is_active
        FROM users u
        INNER JOIN user_relationships ur ON u.id = ur.primary_user_id
        WHERE ur.secondary_user_id = ? 
          AND ur.relationship_type = 'parent_child' 
          AND ur.status = 'active'
          AND u.is_active = 1
        ORDER BY u.first_name, u.last_name
      `, [studentId]);

      return parents;
    } catch (error) {
      console.error('❌ Error getting parents for student:', error);
      return [];
    }
  }

  /**
   * Update relationship status
   */
  static async updateRelationshipStatus(
    relationshipId: number,
    status: 'active' | 'inactive' | 'pending'
  ): Promise<UserRelationship | null> {
    try {
      await DatabaseAdapter.run(`
        UPDATE user_relationships SET status = ? WHERE id = ?
      `, [status, relationshipId]);

      return this.getRelationshipById(relationshipId);
    } catch (error) {
      console.error('❌ Error updating relationship status:', error);
      throw error;
    }
  }

  /**
   * Delete relationship
   */
  static async deleteRelationship(relationshipId: number): Promise<boolean> {
    try {
      const result = await DatabaseAdapter.run(`
        DELETE FROM user_relationships WHERE id = ?
      `, [relationshipId]);

      return (result.changes || 0) > 0;
    } catch (error) {
      console.error('❌ Error deleting relationship:', error);
      return false;
    }
  }

  /**
   * Get all relationships for a user
   */
  static async getRelationshipsForUser(userId: number): Promise<RelationshipWithUsers[]> {
    try {
      const relationships = await DatabaseAdapter.all<any>(`
        SELECT 
          ur.*,
          u1.id as primary_user_id, u1.email as primary_email, u1.first_name as primary_first_name, 
          u1.last_name as primary_last_name, u1.role as primary_role,
          u2.id as secondary_user_id, u2.email as secondary_email, u2.first_name as secondary_first_name,
          u2.last_name as secondary_last_name, u2.role as secondary_role
        FROM user_relationships ur
        INNER JOIN users u1 ON ur.primary_user_id = u1.id
        INNER JOIN users u2 ON ur.secondary_user_id = u2.id
        WHERE (ur.primary_user_id = ? OR ur.secondary_user_id = ?) AND ur.status = 'active'
        ORDER BY ur.created_at DESC
      `, [userId, userId]);

      return relationships.map((rel: any) => ({
        id: rel.id,
        primary_user_id: rel.primary_user_id,
        secondary_user_id: rel.secondary_user_id,
        relationship_type: rel.relationship_type,
        status: rel.status,
        created_at: rel.created_at,
        created_by: rel.created_by,
        primary_user: {
          id: rel.primary_user_id,
          email: rel.primary_email,
          first_name: rel.primary_first_name,
          last_name: rel.primary_last_name,
          role: rel.primary_role,
          createdAt: new Date(rel.primary_created_at || rel.created_at),
          updatedAt: new Date(rel.primary_updated_at || rel.created_at)
        } as User,
        secondary_user: {
          id: rel.secondary_user_id,
          email: rel.secondary_email,
          first_name: rel.secondary_first_name,
          last_name: rel.secondary_last_name,
          role: rel.secondary_role,
          createdAt: new Date(rel.secondary_created_at || rel.created_at),
          updatedAt: new Date(rel.secondary_updated_at || rel.created_at)
        } as User
      }));
    } catch (error) {
      console.error('❌ Error getting relationships for user:', error);
      return [];
    }
  }

  /**
   * Check if user has permission to access another user's data
   */
  static async hasPermission(
    requestingUserId: number,
    targetUserId: number
  ): Promise<boolean> {
    try {
      // Users can always access their own data
      if (requestingUserId === targetUserId) {
        return true;
      }

      // Check if there's an active relationship
      const relationship = await DatabaseAdapter.get(`
        SELECT id FROM user_relationships 
        WHERE ((primary_user_id = ? AND secondary_user_id = ?) OR 
               (primary_user_id = ? AND secondary_user_id = ?))
          AND status = 'active'
      `, [requestingUserId, targetUserId, targetUserId, requestingUserId]);

      return !!relationship;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  }
}