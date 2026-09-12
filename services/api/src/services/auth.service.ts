import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool, getDbAvailability } from '../db/connection.js';

export type UserRole = 'field_officer' | 'district_admin' | 'mdoner_admin';

export const VALID_ROLES: UserRole[] = [
  'field_officer',
  'district_admin',
  'mdoner_admin',
];

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'sauraroute-dev-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_SALT_ROUNDS = 10;

// Demo seed users for rapid development & fallback testing
const defaultPasswordHash = bcrypt.hashSync('SauraRoute2026!', BCRYPT_SALT_ROUNDS);
const inMemoryUsers = new Map<string, UserRecord>([
  [
    'usr_field_01',
    {
      id: 'usr_field_01',
      email: 'field@sauraroute.gov.in',
      password_hash: defaultPasswordHash,
      role: 'field_officer',
      created_at: new Date().toISOString(),
    },
  ],
  [
    'usr_district_01',
    {
      id: 'usr_district_01',
      email: 'district@sauraroute.gov.in',
      password_hash: defaultPasswordHash,
      role: 'district_admin',
      created_at: new Date().toISOString(),
    },
  ],
  [
    'usr_mdoner_01',
    {
      id: 'usr_mdoner_01',
      email: 'mdoner@sauraroute.gov.in',
      password_hash: defaultPasswordHash,
      role: 'mdoner_admin',
      created_at: new Date().toISOString(),
    },
  ],
]);

export class AuthService {
  /**
   * Hashes a plaintext password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Compares a plaintext password against a stored bcrypt hash.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Signs a JWT with the user's id, email, and role.
   */
  signToken(payload: { userId: string; email: string; role: UserRole }): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verifies and decodes a JWT token.
   */
  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  /**
   * Strips sensitive fields such as password_hash from the user record.
   */
  sanitizeUser(user: UserRecord): UserProfile {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };
  }

  /**
   * Finds a user by email (case-insensitive).
   */
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (getDbAvailability()) {
      try {
        const client = await pool.connect();
        try {
          const query = `
            SELECT id, email, password_hash, role, created_at
            FROM users
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1;
          `;
          const { rows } = await client.query(query, [normalizedEmail]);
          if (rows.length > 0) {
            const user = rows[0] as UserRecord;
            inMemoryUsers.set(user.id, user);
            return user;
          }
        } finally {
          client.release();
        }
      } catch {
        // Fallback to in-memory store below
      }
    }

    // In-memory fallback
    for (const user of inMemoryUsers.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  /**
   * Finds a user by id.
   */
  async findUserById(id: string): Promise<UserRecord | null> {
    if (getDbAvailability()) {
      try {
        const client = await pool.connect();
        try {
          const query = `
            SELECT id, email, password_hash, role, created_at
            FROM users
            WHERE id = $1
            LIMIT 1;
          `;
          const { rows } = await client.query(query, [id]);
          if (rows.length > 0) {
            const user = rows[0] as UserRecord;
            inMemoryUsers.set(user.id, user);
            return user;
          }
        } finally {
          client.release();
        }
      } catch {
        // Fallback to in-memory store below
      }
    }

    // In-memory fallback
    return inMemoryUsers.get(id) || null;
  }

  /**
   * Creates a new user with hashed password and persists to DB / in-memory store.
   */
  async createUser(params: {
    email: string;
    password: string;
    role: UserRole;
  }): Promise<UserRecord> {
    const normalizedEmail = params.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error(`User with email "${normalizedEmail}" already exists.`);
    }

    const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const passwordHash = await this.hashPassword(params.password);
    const now = new Date().toISOString();

    if (getDbAvailability()) {
      try {
        const client = await pool.connect();
        try {
          const query = `
            INSERT INTO users (id, email, password_hash, role, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, email, password_hash, role, created_at;
          `;
          const { rows } = await client.query(query, [
            id,
            normalizedEmail,
            passwordHash,
            params.role,
          ]);
          const record = rows[0] as UserRecord;
          inMemoryUsers.set(record.id, record);
          return record;
        } finally {
          client.release();
        }
      } catch {
        // Fallback to in-memory store below
      }
    }

    // Fallback in-memory store
    const fallbackRecord: UserRecord = {
      id,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: params.role,
      created_at: now,
    };
    inMemoryUsers.set(id, fallbackRecord);
    return fallbackRecord;
  }
}

export const authService = new AuthService();
