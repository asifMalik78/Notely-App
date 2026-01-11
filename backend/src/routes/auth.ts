/**
 * Auth Routes
 * Authentication endpoints
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import passport from '../config/passport.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { generateOAuthState, verifyOAuthState } from '../utils/oauth-state.js';
import { COOKIE_MAX_AGE } from '../config/constants.js';
import { isProduction, env } from '../config/env.js';

interface OAuthUser {
  id: string;
  email: string;
}

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

// Public routes
router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

// Protected routes
router.get('/me', authMiddleware, asyncHandler(authController.me.bind(authController)));
router.put('/me', authMiddleware, asyncHandler(authController.updateProfile.bind(authController)));
router.post('/me/avatar', authMiddleware, asyncHandler(authController.uploadAvatar.bind(authController)));

// Google OAuth routes
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', (req, res, next) => {
    const state = generateOAuthState();
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state,
      session: false,
    })(req, res, next);
  });

  router.get('/google/callback', (req, res, next) => {
    const state = req.query.state as string;
    if (!verifyOAuthState(state)) {
      return res.redirect(`${env.CLIENT_URL}/login?error=invalid_state`);
    }

    passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.CLIENT_URL}/login?error=google_auth_failed`,
    }, (err: Error | null, user: OAuthUser) => {
      if (err || !user) {
        return res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
      }

      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
      });
      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
      });

      res.redirect(`${env.CLIENT_URL}/dashboard`);
    })(req, res, next);
  });
} else {
  router.get('/google', (_req, res) => {
    res.status(501).json({ error: 'Google OAuth is not configured' });
  });
}

// GitHub OAuth routes
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  router.get('/github', (req, res, next) => {
    const state = generateOAuthState();
    passport.authenticate('github', {
      scope: ['user:email'],
      state,
      session: false,
    })(req, res, next);
  });

  router.get('/github/callback', (req, res, next) => {
    const state = req.query.state as string;
    if (!verifyOAuthState(state)) {
      return res.redirect(`${env.CLIENT_URL}/login?error=invalid_state`);
    }

    passport.authenticate('github', {
      session: false,
      failureRedirect: `${env.CLIENT_URL}/login?error=github_auth_failed`,
    }, (err: Error | null, user: OAuthUser) => {
      if (err || !user) {
        return res.redirect(`${env.CLIENT_URL}/login?error=github_auth_failed`);
      }

      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
      });
      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
      });

      res.redirect(`${env.CLIENT_URL}/dashboard`);
    })(req, res, next);
  });
} else {
  router.get('/github', (_req, res) => {
    res.status(501).json({ error: 'GitHub OAuth is not configured' });
  });
}

export default router;
