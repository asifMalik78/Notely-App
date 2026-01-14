/**
 * Auth Service
 * Handles authentication business logic
 */

import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import type { PublicUser } from '../types/entities.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name,
    });

    // Generate tokens
    const tokenPayload = { userId, email };
    const tokens: AuthTokens = {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };

    const now = new Date();
    return {
      user: {
        id: userId,
        email,
        name,
        avatarUrl: null,
        dob: null,
        description: null,
        provider: null,
        createdAt: now,
        updatedAt: now,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user signed up via OAuth (no password)
    if (!user.password) {
      throw new UnauthorizedError(
        `This account uses ${user.provider || 'OAuth'} login. Please sign in with ${user.provider || 'OAuth'}.`
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const tokens: AuthTokens = {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };

    const { password: _password, providerId: _providerId, ...publicUser } = user;
    void _password;
    void _providerId;
    return {
      user: publicUser,
      tokens,
    };
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokenPayload = { userId: user.id, email: user.email };
    return {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return user without password and providerId
    const { password: _password, providerId: _providerId, ...publicUser } = user;
    void _password;
    void _providerId;
    return publicUser as PublicUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; dob?: string; description?: string }
  ): Promise<PublicUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: { name?: string; dob?: Date; description?: string | null } = {};
    if (data.name) updateData.name = data.name;
    if (data.dob) updateData.dob = new Date(data.dob);
    if (data.description !== undefined) updateData.description = data.description;

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, userId));
    }

    return this.getCurrentUser(userId);
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<PublicUser> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));

    return this.getCurrentUser(userId);
  }

  /**
   * Generate tokens for OAuth authenticated user
   */
  generateOAuthTokens(user: { id: string; email: string }): AuthTokens {
    const tokenPayload = { userId: user.id, email: user.email };
    return {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
