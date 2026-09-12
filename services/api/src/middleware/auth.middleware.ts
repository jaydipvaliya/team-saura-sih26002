import { Request, Response, NextFunction } from 'express';
import { authService, JwtPayload, UserRole } from '../services/auth.service.js';

// Extend Express Request interface with authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware that requires a valid JWT Bearer token in the Authorization header.
 * Attaches the decoded payload to `req.user`.
 * Rejects requests with missing, malformed, or invalid tokens with HTTP 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required. Missing Authorization header.',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid Authorization header format. Expected "Bearer <token>".',
    });
    return;
  }

  const token = parts[1].trim();

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired authentication token.',
    });
  }
}

/**
 * Middleware factory that restricts access to users with specified role(s).
 * Must be used after `requireAuth`.
 * Rejects unauthorized roles with HTTP 403.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required before checking authorization.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: `Forbidden: role "${req.user.role}" does not have required permissions. Required one of: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
