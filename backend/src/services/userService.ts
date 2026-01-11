import bcrypt from 'bcrypt';
import { DatabaseAdapter } from './databaseAdapter';
import { User, StudentProfile, CounselorProfile, ParentProfile, UserRole } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface CreateStudentProfileData {
  grade?: number;
  schoolName?: string;
  zipCode?: string;
  interests?: string[];
  skills?: string[];
  educationGoal?: string;
  workEnvironment?: string;
  gpa?: number;
  extracurricularActivities?: string[];
  careerAspirations?: string;
}

export interface CreateCounselorProfileData {
  schoolDistrict?: string;
  specializations?: string[];
  yearsExperience?: number;
  licenseNumber?: string;
  bio?: string;
}

export interface CreateParentProfileData {
  occupation?: string;
  educationLevel?: string;
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Insert user
      const result = await DatabaseAdapter.run(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userData.email,
        passwordHash,
        userData.firstName,
        userData.lastName,
        userData.role,
        userData.phone || null
      ]);

      const userId = result.lastID;
      if (!userId) {
        throw new Error('Failed to create user');
      }

      // Get the created user
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }

      // console.log(`✅ Created ${userData.role} user:`, userData.email);
      return user;
    } catch (error) {
      // console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const user = await DatabaseAdapter.get<User>(`
        SELECT id, email, first_name, last_name, role, phone, created_at, updated_at, is_active
        FROM users WHERE id = ?
      `, [userId]);

      return user || null;
    } catch (error) {
      // console.error('❌ Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await DatabaseAdapter.get<User>(`
        SELECT id, email, first_name, last_name, role, phone, created_at, updated_at, is_active
        FROM users WHERE email = ?
      `, [email]);

      return user || null;
    } catch (error) {
      // console.error('❌ Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Authenticate user
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await DatabaseAdapter.get<any>(`
        SELECT id, email, password_hash, first_name, last_name, role, phone, created_at, updated_at, is_active
        FROM users WHERE email = ? AND is_active = 1
      `, [email]);

      if (!user) {
        return null;
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return null;
      }

      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      // console.error('❌ Error authenticating user:', error);
      return null;
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId: number, updates: Partial<CreateUserData>): Promise<User | null> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.firstName) {
        updateFields.push('first_name = ?');
        updateValues.push(updates.firstName);
      }
      if (updates.lastName) {
        updateFields.push('last_name = ?');
        updateValues.push(updates.lastName);
      }
      if (updates.phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(updates.phone);
      }
      if (updates.password) {
        const passwordHash = await bcrypt.hash(updates.password, 10);
        updateFields.push('password_hash = ?');
        updateValues.push(passwordHash);
      }

      if (updateFields.length === 0) {
        return this.getUserById(userId);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(userId);

      await DatabaseAdapter.run(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues);

      return this.getUserById(userId);
    } catch (error) {
      // console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  /**
   * Create student profile
   */
  static async createStudentProfile(userId: number, profileData: CreateStudentProfileData): Promise<StudentProfile> {
    try {
      // Validate ZIP code format if provided
      if (profileData.zipCode && profileData.zipCode.trim() !== '') {
        const zipCodeRegex = /^\d{5}$/;
        if (!zipCodeRegex.test(profileData.zipCode)) {
          throw new Error('ZIP code must be exactly 5 digits (e.g., 12345)');
        }
      }

      const result = await DatabaseAdapter.run(`
        INSERT INTO student_profiles (
          user_id, grade, school_name, zip_code, interests, skills, 
          education_goal, work_environment, gpa, extracurricular_activities, career_aspirations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        profileData.grade || null,
        profileData.schoolName || null,
        profileData.zipCode || null,
        JSON.stringify(profileData.interests || []),
        JSON.stringify(profileData.skills || []),
        profileData.educationGoal || null,
        profileData.workEnvironment || null,
        profileData.gpa || null,
        JSON.stringify(profileData.extracurricularActivities || []),
        profileData.careerAspirations || null
      ]);

      const profileId = result.lastID;
      if (!profileId) {
        throw new Error('Failed to create student profile');
      }

      const profile = await this.getStudentProfile(userId);
      if (!profile) {
        throw new Error('Failed to retrieve created student profile');
      }

      // console.log('✅ Created student profile for user:', userId);
      return profile;
    } catch (error) {
      // console.error('❌ Error creating student profile:', error);
      throw error;
    }
  }

  /**
   * Get student profile
   */
  static async getStudentProfile(userId: number): Promise<StudentProfile | null> {
    try {
      const profile = await DatabaseAdapter.get<any>(`
        SELECT * FROM student_profiles WHERE user_id = ?
      `, [userId]);

      if (!profile) {
        return null;
      }

      // Parse JSON fields
      return {
        ...profile,
        interests: JSON.parse(profile.interests || '[]'),
        skills: JSON.parse(profile.skills || '[]'),
        extracurricular_activities: JSON.parse(profile.extracurricular_activities || '[]')
      } as StudentProfile;
    } catch (error) {
      // console.error('❌ Error getting student profile:', error);
      return null;
    }
  }

  /**
   * Update student profile
   */
  static async updateStudentProfile(userId: number, updates: Partial<CreateStudentProfileData>): Promise<StudentProfile | null> {
    try {
      // Validate ZIP code format if provided
      if (updates.zipCode !== undefined && updates.zipCode !== null && updates.zipCode !== '') {
        const zipCodeRegex = /^\d{5}$/;
        if (!zipCodeRegex.test(updates.zipCode)) {
          throw new Error('ZIP code must be exactly 5 digits (e.g., 12345)');
        }
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.grade !== undefined) {
        updateFields.push('grade = ?');
        updateValues.push(updates.grade);
      }
      if (updates.schoolName !== undefined) {
        updateFields.push('school_name = ?');
        updateValues.push(updates.schoolName);
      }
      if (updates.zipCode !== undefined) {
        updateFields.push('zip_code = ?');
        updateValues.push(updates.zipCode);
      }
      if (updates.interests !== undefined) {
        updateFields.push('interests = ?');
        updateValues.push(JSON.stringify(updates.interests));
      }
      if (updates.skills !== undefined) {
        updateFields.push('skills = ?');
        updateValues.push(JSON.stringify(updates.skills));
      }
      if (updates.educationGoal !== undefined) {
        updateFields.push('education_goal = ?');
        updateValues.push(updates.educationGoal);
      }
      if (updates.workEnvironment !== undefined) {
        updateFields.push('work_environment = ?');
        updateValues.push(updates.workEnvironment);
      }
      if (updates.gpa !== undefined) {
        updateFields.push('gpa = ?');
        updateValues.push(updates.gpa);
      }
      if (updates.extracurricularActivities !== undefined) {
        updateFields.push('extracurricular_activities = ?');
        updateValues.push(JSON.stringify(updates.extracurricularActivities));
      }
      if (updates.careerAspirations !== undefined) {
        updateFields.push('career_aspirations = ?');
        updateValues.push(updates.careerAspirations);
      }

      if (updateFields.length === 0) {
        return this.getStudentProfile(userId);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(userId);

      await DatabaseAdapter.run(`
        UPDATE student_profiles SET ${updateFields.join(', ')} WHERE user_id = ?
      `, updateValues);

      return this.getStudentProfile(userId);
    } catch (error) {
      // console.error('❌ Error updating student profile:', error);
      throw error;
    }
  }

  /**
   * Create counselor profile
   */
  static async createCounselorProfile(userId: number, profileData: CreateCounselorProfileData): Promise<CounselorProfile> {
    try {
      const result = await DatabaseAdapter.run(`
        INSERT INTO counselor_profiles (
          user_id, school_district, specializations, years_experience, license_number, bio
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        profileData.schoolDistrict || null,
        JSON.stringify(profileData.specializations || []),
        profileData.yearsExperience || null,
        profileData.licenseNumber || null,
        profileData.bio || null
      ]);

      const profile = await this.getCounselorProfile(userId);
      if (!profile) {
        throw new Error('Failed to retrieve created counselor profile');
      }

      // console.log('✅ Created counselor profile for user:', userId);
      return profile;
    } catch (error) {
      // console.error('❌ Error creating counselor profile:', error);
      throw error;
    }
  }

  /**
   * Get counselor profile
   */
  static async getCounselorProfile(userId: number): Promise<CounselorProfile | null> {
    try {
      const profile = await DatabaseAdapter.get<any>(`
        SELECT * FROM counselor_profiles WHERE user_id = ?
      `, [userId]);

      if (!profile) {
        return null;
      }

      return {
        ...profile,
        specializations: JSON.parse(profile.specializations || '[]')
      } as CounselorProfile;
    } catch (error) {
      // console.error('❌ Error getting counselor profile:', error);
      return null;
    }
  }

  /**
   * Create parent profile
   */
  static async createParentProfile(userId: number, profileData: CreateParentProfileData): Promise<ParentProfile> {
    try {
      const result = await DatabaseAdapter.run(`
        INSERT INTO parent_profiles (user_id, occupation, education_level)
        VALUES (?, ?, ?)
      `, [
        userId,
        profileData.occupation || null,
        profileData.educationLevel || null
      ]);

      const profile = await this.getParentProfile(userId);
      if (!profile) {
        throw new Error('Failed to retrieve created parent profile');
      }

      // console.log('✅ Created parent profile for user:', userId);
      return profile;
    } catch (error) {
      // console.error('❌ Error creating parent profile:', error);
      throw error;
    }
  }

  /**
   * Get parent profile
   */
  static async getParentProfile(userId: number): Promise<ParentProfile | null> {
    try {
      const profile = await DatabaseAdapter.get<ParentProfile>(`
        SELECT * FROM parent_profiles WHERE user_id = ?
      `, [userId]);

      return profile || null;
    } catch (error) {
      // console.error('❌ Error getting parent profile:', error);
      return null;
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await DatabaseAdapter.all<User>(`
        SELECT id, email, first_name, last_name, role, phone, created_at, updated_at, is_active
        FROM users WHERE role = ? AND is_active = 1
        ORDER BY first_name, last_name
      `, [role]);

      return users;
    } catch (error) {
      // console.error('❌ Error getting users by role:', error);
      return [];
    }
  }
}