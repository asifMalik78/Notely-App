/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { ValidationError, UnauthorizedError } from '../utils/errors.js';
import { COOKIE_MAX_AGE } from '../config/constants.js';
import { isProduction, env } from '../config/env.js';
import passport from '../config/passport.js';
import { generateOAuthState, verifyOAuthState } from '../utils/oauth-state.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const result = await authService.register(validation.data);

    // Set cookies
    res.cookie('accessToken', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
    });
    res.cookie('refreshToken', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
    });

    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      message: 'Registration successful',
    });
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', validation.error.errors);
    }

    const result = await authService.login(validation.data);

    // Set cookies
    res.cookie('accessToken', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
    });
    res.cookie('refreshToken', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
    });

    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
      },
      message: 'Login successful',
    });
  }

  /**
   * POST /api/auth/logout
   */
  logout(_req: Request, res: Response): void {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json({ message: 'Logout successful' });
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const tokens = await authService.refreshTokens(refreshToken);

    // Set new cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
    });

    res.json({ message: 'Token refreshed' });
  }

  /**
   * GET /api/auth/me
   * Protected route - requires authentication
   */
  async me(req: Request, res: Response): Promise<void> {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.json({ user });
  }

  /**
   * PUT /api/auth/me
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    const { name, dob, description } = req.body;
    const user = await authService.updateProfile(req.user!.userId, { name, dob, description });
    res.json({ user, message: 'Profile updated successfully' });
  }

  /**
   * POST /api/auth/me/avatar
   * Upload avatar (base64 or URL)
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      throw new ValidationError('Avatar URL is required');
    }
    const user = await authService.updateAvatar(req.user!.userId, avatarUrl);
    res.json({ user, message: 'Avatar updated successfully' });
  }

  /**
   * GET /api/auth/google
   * Initiate Google OAuth flow
   */
  googleAuth(req: Request, res: Response, next: NextFunction): void {
    const state = generateOAuthState();
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state,
      session: false,
    })(req, res, next);
  }

  /**
   * GET /api/auth/google/callback
   * Handle Google OAuth callback
   */
  googleCallback(req: Request, res: Response, next: NextFunction): void {
    const state = req.query.state as string;
    if (!verifyOAuthState(state)) {
      res.redirect(`${env.CLIENT_URL}/login?error=invalid_state`);
      return;
    }

    passport.authenticate(
      'google',
      {
        session: false,
        failureRedirect: `${env.CLIENT_URL}/login?error=google_auth_failed`,
      },
      (err: Error | null, user: { id: string; email: string } | undefined) => {
        if (err) {
          console.error('[Google Callback] Auth error:', err);
          return res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
        }
        if (!user) {
          console.error('[Google Callback] No user returned');
          return res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
        }

        console.log('[Google Callback] Generating tokens for user:', user.id);
        const tokens = authService.generateOAuthTokens(user);

        res.cookie('accessToken', tokens.accessToken, {
          ...COOKIE_OPTIONS,
          maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
          ...COOKIE_OPTIONS,
          maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
        });

        res.redirect(`${env.CLIENT_URL}/dashboard`);
      }
    )(req, res, next);
  }

  /**
   * GET /api/auth/github
   * Initiate GitHub OAuth flow
   */
  githubAuth(req: Request, res: Response, next: NextFunction): void {
    const state = generateOAuthState();
    passport.authenticate('github', {
      scope: ['user:email'],
      state,
      session: false,
    })(req, res, next);
  }

  /**
   * GET /api/auth/github/callback
   * Handle GitHub OAuth callback
   */
  githubCallback(req: Request, res: Response, next: NextFunction): void {
    const state = req.query.state as string;
    if (!verifyOAuthState(state)) {
      res.redirect(`${env.CLIENT_URL}/login?error=invalid_state`);
      return;
    }

    passport.authenticate(
      'github',
      {
        session: false,
        failureRedirect: `${env.CLIENT_URL}/login?error=github_auth_failed`,
      },
      (err: Error | null, user: { id: string; email: string } | undefined) => {
        if (err) {
          console.error('[GitHub Callback] Auth error:', err);
          return res.redirect(`${env.CLIENT_URL}/login?error=github_auth_failed`);
        }
        if (!user) {
          console.error('[GitHub Callback] No user returned');
          return res.redirect(`${env.CLIENT_URL}/login?error=github_auth_failed`);
        }

        console.log('[GitHub Callback] Generating tokens for user:', user.id);
        const tokens = authService.generateOAuthTokens(user);

        res.cookie('accessToken', tokens.accessToken, {
          ...COOKIE_OPTIONS,
          maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
        });
        res.cookie('refreshToken', tokens.refreshToken, {
          ...COOKIE_OPTIONS,
          maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
        });

        res.redirect(`${env.CLIENT_URL}/dashboard`);
      }
    )(req, res, next);
  }
}

// Export singleton instance
export const authController = new AuthController();
