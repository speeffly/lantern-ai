import express from 'express';
import { AuthServiceDB, RegisterUserData } from '../services/authServiceDB';
import { RelationshipService } from '../services/relationshipService';
import { ApiResponse } from '../types';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const userData: RegisterUserData = req.body;

    // Validate required fields
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, firstName, lastName, role'
      } as ApiResponse);
    }

    // Validate role
    if (!['student', 'counselor', 'parent'].includes(userData.role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be student, counselor, or parent'
      } as ApiResponse);
    }

    const result = await AuthServiceDB.registerUser(userData);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'User registered successfully'
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      } as ApiResponse);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    } as ApiResponse);
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
    }

    const result = await AuthServiceDB.loginUser(email, password);

    if (result.success) {
      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'Login successful'
      } as ApiResponse);
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      } as ApiResponse);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    } as ApiResponse);
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse);
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const profile = await AuthServiceDB.getUserProfile(user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    } as ApiResponse);
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse);
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const result = await AuthServiceDB.updateUserProfile(user.id, req.body);

    if (result.success) {
      res.json({
        success: true,
        data: result.user,
        message: 'Profile updated successfully'
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      } as ApiResponse);
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    } as ApiResponse);
  }
});

// GET /api/auth/related-users - Get related users (students for counselor, children for parent, etc.)
router.get('/related-users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse);
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const relatedUsers = await AuthServiceDB.getRelatedUsers(user.id, user.role);

    res.json({
      success: true,
      data: relatedUsers,
      message: 'Related users retrieved successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Related users retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve related users'
    } as ApiResponse);
  }
});

// POST /api/auth/create-relationship - Create relationship between users
router.post('/create-relationship', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse);
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const { secondaryUserId, relationshipType } = req.body;

    if (!secondaryUserId || !relationshipType) {
      return res.status(400).json({
        success: false,
        error: 'secondaryUserId and relationshipType are required'
      } as ApiResponse);
    }

    if (!['parent_child', 'counselor_student'].includes(relationshipType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid relationship type'
      } as ApiResponse);
    }

    const result = await AuthServiceDB.createRelationship(
      user.id,
      secondaryUserId,
      relationshipType,
      user.id
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Relationship created successfully'
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      } as ApiResponse);
    }
  } catch (error) {
    console.error('Relationship creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create relationship'
    } as ApiResponse);
  }
});

// POST /api/auth/link-session - Link anonymous session to user account
router.post('/link-session', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse);
    }

    const user = AuthServiceDB.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const { sessionToken } = req.body;
    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Session token is required'
      } as ApiResponse);
    }

    const success = await AuthServiceDB.linkSessionToUser(user.id, sessionToken);

    if (success) {
      res.json({
        success: true,
        message: 'Session linked to user account successfully'
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to link session to user account'
      } as ApiResponse);
    }
  } catch (error) {
    console.error('Session linking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link session'
    } as ApiResponse);
  }
});

export default router;