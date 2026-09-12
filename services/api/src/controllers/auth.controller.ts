import { Request, Response, NextFunction } from 'express';
import { authService, VALID_ROLES, UserRole } from '../services/auth.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, role } = req.body;

    // Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        status: 'error',
        message: 'A valid "email" address is required.',
      });
      return;
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        status: 'error',
        message: 'A "password" of at least 6 characters is required.',
      });
      return;
    }

    // Validate role
    if (!role || typeof role !== 'string' || !VALID_ROLES.includes(role as UserRole)) {
      res.status(400).json({
        status: 'error',
        message: `Invalid role "${role}". Allowed roles: ${VALID_ROLES.join(', ')}`,
      });
      return;
    }

    // Check if user already exists
    const existing = await authService.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        status: 'error',
        message: `User with email "${email.trim().toLowerCase()}" already exists.`,
      });
      return;
    }

    const user = await authService.createUser({
      email: email.trim(),
      password,
      role: role as UserRole,
    });

    const token = authService.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: authService.sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Both "email" and "password" are required.',
      });
      return;
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await authService.comparePassword(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = authService.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: authService.sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
      return;
    }

    const user = await authService.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User account not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: authService.sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}
