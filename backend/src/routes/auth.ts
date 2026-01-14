/**
 * Auth Routes
 * Authentication endpoints
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

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
router.get('/google', authController.googleAuth.bind(authController));
router.get('/google/callback', authController.googleCallback.bind(authController));

// GitHub OAuth routes
router.get('/github', authController.githubAuth.bind(authController));
router.get('/github/callback', authController.githubCallback.bind(authController));

export default router;
