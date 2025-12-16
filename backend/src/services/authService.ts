import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User, Student, Counselor, Parent } from '../types';

// In-memory user storage (use database in production)
const users = new Map<string, User>();
const students = new Map<string, Student>();
const counselors = new Map<string, Counselor>();
const parents = new Map<string, Parent>();

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'lantern-ai-secret-key';
  private static readonly SALT_ROUNDS = 10;

  /**
   * Register a new user (universal registration)
   */
  static async registerUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'counselor' | 'parent';
    grade?: number;
    zipCode?: string;
    schoolId?: string;
    childrenInfo?: { firstName: string; lastName: string; grade?: number }[];
  }): Promise<{ success: boolean; user?: Student | Counselor | Parent; token?: string; error?: string }> {
    try {
      // Check if email already exists
      const existingUser = Array.from(users.values()).find(u => u.email === data.email);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // Create base user
      const userId = randomUUID();
      const baseUser: User = {
        id: userId,
        email: data.email,
        role: data.role,
        schoolId: data.schoolId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let userProfile: Student | Counselor | Parent;

      // Create role-specific profile
      if (data.role === 'student') {
        const student: Student = {
          ...baseUser,
          role: 'student',
          firstName: data.firstName,
          lastName: data.lastName,
          grade: data.grade,
          zipCode: data.zipCode,
          profileCompleted: false,
          consentGiven: true
        };
        students.set(userId, student);
        userProfile = student;
      } else if (data.role === 'counselor') {
        const counselor: Counselor = {
          ...baseUser,
          role: 'counselor',
          firstName: data.firstName,
          lastName: data.lastName,
          schoolId: data.schoolId || ''
        };
        counselors.set(userId, counselor);
        userProfile = counselor;
      } else if (data.role === 'parent') {
        const parent: Parent = {
          ...baseUser,
          role: 'parent',
          firstName: data.firstName,
          lastName: data.lastName,
          children: data.childrenInfo?.map(child => ({
            studentId: randomUUID(), // In real app, this would link to actual student IDs
            firstName: child.firstName,
            lastName: child.lastName,
            grade: child.grade
          })) || []
        };
        parents.set(userId, parent);
        userProfile = parent;
      } else {
        return { success: false, error: 'Invalid user role' };
      }

      // Store user and password
      users.set(userId, baseUser);
      (baseUser as any).passwordHash = passwordHash;

      // Generate JWT token
      const token = jwt.sign(
        { userId, email: data.email, role: data.role },
        this.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { success: true, user: userProfile, token };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{
    success: boolean;
    user?: Student | Counselor | Parent;
    token?: string;
    error?: string;
  }> {
    try {
      // Find user by email
      const user = Array.from(users.values()).find(u => u.email === email);
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check password
      const passwordHash = (user as any).passwordHash;
      if (!passwordHash) {
        return { success: false, error: 'Invalid account' };
      }

      const isValidPassword = await bcrypt.compare(password, passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Get user profile based on role
      let userProfile: Student | Counselor | Parent;
      if (user.role === 'student') {
        userProfile = students.get(user.id)!;
      } else if (user.role === 'counselor') {
        userProfile = counselors.get(user.id)!;
      } else if (user.role === 'parent') {
        userProfile = parents.get(user.id)!;
      } else {
        return { success: false, error: 'Invalid user role' };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        this.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { success: true, user: userProfile, token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): {
    success: boolean;
    userId?: string;
    email?: string;
    role?: string;
    error?: string;
  } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return {
        success: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      return { success: false, error: 'Invalid token' };
    }
  }

  /**
   * Get user by ID
   */
  static getUserById(userId: string): Student | Counselor | Parent | null {
    const user = users.get(userId);
    if (!user) return null;

    if (user.role === 'student') {
      return students.get(userId) || null;
    } else if (user.role === 'counselor') {
      return counselors.get(userId) || null;
    } else if (user.role === 'parent') {
      return parents.get(userId) || null;
    }

    return null;
  }

  /**
   * Update student profile
   */
  static updateStudentProfile(userId: string, updates: Partial<Student>): boolean {
    const student = students.get(userId);
    if (!student) return false;

    const updatedStudent = {
      ...student,
      ...updates,
      updatedAt: new Date()
    };

    students.set(userId, updatedStudent);
    return true;
  }

  /**
   * Link session data to user account
   */
  static linkSessionToUser(userId: string, sessionId: string): boolean {
    // This would link existing session data to the user account
    // For now, we'll just mark the profile as completed if they have session data
    const student = students.get(userId);
    if (student) {
      student.profileCompleted = true;
      students.set(userId, student);
      return true;
    }
    return false;
  }

  /**
   * Get all students (for counselor dashboard)
   */
  static getAllStudents(): Student[] {
    return Array.from(students.values());
  }

  /**
   * Register a new student (legacy method for backward compatibility)
   */
  static async registerStudent(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    grade?: number;
    zipCode?: string;
    schoolId?: string;
  }): Promise<{ success: boolean; user?: Student; token?: string; error?: string }> {
    const result = await this.registerUser({
      ...data,
      role: 'student'
    });
    
    return {
      success: result.success,
      user: result.user as Student,
      token: result.token,
      error: result.error
    };
  }

  /**
   * Update user profile
   */
  static updateUserProfile(userId: string, updates: any): boolean {
    try {
      const user = users.get(userId);
      if (!user) return false;

      // Update base user data
      if (updates.email) user.email = updates.email;
      user.updatedAt = new Date();
      users.set(userId, user);

      // Update role-specific profile
      if (user.role === 'student') {
        const student = students.get(userId);
        if (student) {
          if (updates.firstName) student.firstName = updates.firstName;
          if (updates.lastName) student.lastName = updates.lastName;
          if (updates.grade !== undefined) student.grade = updates.grade;
          if (updates.zipCode !== undefined) student.zipCode = updates.zipCode;
          student.updatedAt = new Date();
          students.set(userId, student);
        }
      } else if (user.role === 'counselor') {
        const counselor = counselors.get(userId);
        if (counselor) {
          if (updates.firstName) counselor.firstName = updates.firstName;
          if (updates.lastName) counselor.lastName = updates.lastName;
          if (updates.schoolId !== undefined) counselor.schoolId = updates.schoolId;
          counselor.updatedAt = new Date();
          counselors.set(userId, counselor);
        }
      } else if (user.role === 'parent') {
        const parent = parents.get(userId);
        if (parent) {
          if (updates.firstName) parent.firstName = updates.firstName;
          if (updates.lastName) parent.lastName = updates.lastName;
          if (updates.childrenInfo) {
            parent.children = updates.childrenInfo.map((child: any) => ({
              studentId: randomUUID(), // In real app, this would link to actual student IDs
              firstName: child.firstName,
              lastName: child.lastName,
              grade: child.grade
            }));
          }
          parent.updatedAt = new Date();
          parents.set(userId, parent);
        }
      }

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  }

  /**
   * Register counselor (admin function)
   */
  static async registerCounselor(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    schoolId: string;
  }): Promise<{ success: boolean; user?: Counselor; error?: string }> {
    try {
      // Check if email already exists
      const existingUser = Array.from(users.values()).find(u => u.email === data.email);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // Create user
      const userId = randomUUID();
      const user: User = {
        id: userId,
        email: data.email,
        role: 'counselor',
        schoolId: data.schoolId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create counselor profile
      const counselor: Counselor = {
        ...user,
        role: 'counselor',
        firstName: data.firstName,
        lastName: data.lastName,
        schoolId: data.schoolId
      };

      // Store user and counselor
      users.set(userId, user);
      counselors.set(userId, counselor);
      (user as any).passwordHash = passwordHash;

      return { success: true, user: counselor };
    } catch (error) {
      console.error('Counselor registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }
}
