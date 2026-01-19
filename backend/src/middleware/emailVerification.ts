import { Request, Response, NextFunction } from 'express';
import { EmailVerificationService } from '../services/emailVerificationService';
import { AuthServiceDB } from '../services/authServiceDB';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to require email verification for protected routes
 */
export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        needsAuth: true
      });
    }

    // Check if email is verified
    const isVerified = await EmailVerificationService.isEmailVerified(parseInt(req.user.id));
    
    if (!isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email verification required. Please check your email and verify your account.',
        needsVerification: true,
        verificationUrl: '/verify-email'
      });
    }

    // Email is verified, continue to next middleware
    next();
  } catch (error) {
    console.error('❌ Email verification middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check email verification status'
    });
  }
};

/**
 * Middleware to optionally check email verification (warns but doesn't block)
 */
export const checkEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user && req.user.id) {
      const isVerified = await EmailVerificationService.isEmailVerified(parseInt(req.user.id));
      
      // Add verification status to request for use in route handlers
      (req as any).emailVerified = isVerified;
      
      if (!isVerified) {
        console.log(`⚠️ User ${req.user.id} accessing route without email verification`);
      }
    }

    next();
  } catch (error) {
    console.error('❌ Email verification check error:', error);
    // Don't block the request, just log the error
    next();
  }
};