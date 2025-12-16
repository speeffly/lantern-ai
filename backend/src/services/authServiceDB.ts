import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types';
import { UserService, CreateUserData, CreateStudentProfileData, CreateCounselorProfileData, CreateParentProfileData } from './userService';
import { RelationshipService } from './relationshipService';

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  // Student-specific fields
  grade?: number;
  schoolName?: string;
  zipCode?: string;
  interests?: string[];
  skills?: string[];
  educationGoal?: string;
  workEnvironment?: string;
  // Counselor-specific fields
  schoolDistrict?: string;
  specializations?: string[];
  yearsExperience?: number;
  licenseNumber?: string;
  bio?: string;
  // Parent-specific fields
  occupation?: string;
  educationLevel?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class AuthServiceDB {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'lantern-ai-secret-key';

  /**
   * Register a new user with role-specific profile
   */
  static async registerUser(data: RegisterUserData): Promise<AuthResponse> {
    try {
      // Create base user
      const userData: CreateUserData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone
      };

      const user = await UserService.createUser(userData);

      // Create role-specific profile
      switch (data.role) {
        case 'student':
          const studentProfileData: CreateStudentProfileData = {
            grade: data.grade,
            schoolName: data.schoolName,
            zipCode: data.zipCode,
            interests: data.interests,
            skills: data.skills,
            educationGoal: data.educationGoal,
            workEnvironment: data.workEnvironment
          };
          await UserService.createStudentProfile(user.id, studentProfileData);
          break;

        case 'counselor':
          const counselorProfileData: CreateCounselorProfileData = {
            schoolDistrict: data.schoolDistrict,
            specializations: data.specializations,
            yearsExperience: data.yearsExperience,
            licenseNumber: data.licenseNumber,
            bio: data.bio
          };
          await UserService.createCounselorProfile(user.id, counselorProfileData);
          break;

        case 'parent':
          const parentProfileData: CreateParentProfileData = {
            occupation: data.occupation,
            educationLevel: data.educationLevel
          };
          await UserService.createParentProfile(user.id, parentProfileData);
          break;
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Login user
   */
  static async loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await UserService.authenticateUser(email, password);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  /**
   * Get user profile with role-specific data
   */
  static async getUserProfile(userId: number): Promise<any> {
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return null;
      }

      let profile = null;
      switch (user.role) {
        case 'student':
          profile = await UserService.getStudentProfile(userId);
          break;
        case 'counselor':
          profile = await UserService.getCounselorProfile(userId);
          break;
        case 'parent':
          profile = await UserService.getParentProfile(userId);
          break;
      }

      return {
        ...user,
        profile
      };
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: number, updates: any): Promise<AuthResponse> {
    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Update base user info if provided
      if (updates.firstName || updates.lastName || updates.phone || updates.password) {
        await UserService.updateUser(userId, {
          firstName: updates.firstName,
          lastName: updates.lastName,
          phone: updates.phone,
          password: updates.password
        });
      }

      // Update role-specific profile
      switch (user.role) {
        case 'student':
          if (updates.grade !== undefined || updates.schoolName !== undefined || 
              updates.zipCode !== undefined || updates.interests !== undefined ||
              updates.skills !== undefined || updates.educationGoal !== undefined ||
              updates.workEnvironment !== undefined) {
            await UserService.updateStudentProfile(userId, updates);
          }
          break;
        // Add counselor and parent profile updates as needed
      }

      const updatedProfile = await this.getUserProfile(userId);
      
      return {
        success: true,
        user: updatedProfile
      };
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  }

  /**
   * Create relationship between users
   */
  static async createRelationship(
    primaryUserId: number,
    secondaryUserId: number,
    relationshipType: 'parent_child' | 'counselor_student',
    createdBy?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await RelationshipService.createRelationship(
        primaryUserId,
        secondaryUserId,
        relationshipType,
        createdBy
      );

      return { success: true };
    } catch (error: any) {
      console.error('❌ Relationship creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create relationship'
      };
    }
  }

  /**
   * Get related users (students for counselor, children for parent, etc.)
   */
  static async getRelatedUsers(userId: number, userRole: UserRole): Promise<User[]> {
    try {
      switch (userRole) {
        case 'counselor':
          return await RelationshipService.getStudentsForCounselor(userId);
        case 'parent':
          return await RelationshipService.getChildrenForParent(userId);
        case 'student':
          // Get counselor and parents for student
          const counselor = await RelationshipService.getCounselorForStudent(userId);
          const parents = await RelationshipService.getParentsForStudent(userId);
          return [...(counselor ? [counselor] : []), ...parents];
        default:
          return [];
      }
    } catch (error) {
      console.error('❌ Error getting related users:', error);
      return [];
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): User | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return decoded.user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private static generateToken(user: User): string {
    return jwt.sign(
      { 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Check if user has permission to access data
   */
  static async hasPermission(requestingUserId: number, targetUserId: number): Promise<boolean> {
    return await RelationshipService.hasPermission(requestingUserId, targetUserId);
  }

  /**
   * Link anonymous session to user account
   */
  static async linkSessionToUser(userId: number, sessionToken: string): Promise<boolean> {
    try {
      // This would update the assessment_sessions table to link the session to the user
      // Implementation depends on how you want to handle session linking
      console.log(`🔗 Linking session ${sessionToken} to user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error linking session to user:', error);
      return false;
    }
  }
}