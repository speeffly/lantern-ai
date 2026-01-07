import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    user?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    console.log('Decoded token:', decoded);

    // Handle both token formats:
    // 1. Nested format from authServiceDB: { user: { id, email, firstName, lastName, role } }
    // 2. Flat format from authService: { userId, email, role }
    if (decoded.user) {
      // Nested format from authServiceDB
      req.user = decoded;
    } else {
      // Flat format from authService - convert to nested format for compatibility
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        user: {
          id: decoded.userId,
          email: decoded.email,
          firstName: '',
          lastName: '',
          role: decoded.role
        }
      };
    }

    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};