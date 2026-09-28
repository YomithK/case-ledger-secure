import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { startGoogleAuth, googleCallback } from '../controllers/oauth.controller.js';
import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// Public routes (rate limited against brute-force / mass registration)
router.post('/register', registerLimiter, registerValidation, authController.register);
router.post('/login', loginLimiter, loginValidation, authController.login);

// Sign in with Google (OpenID Connect, Authorization Code + PKCE)
router.get('/google', startGoogleAuth);
router.get('/google/callback', googleCallback);

export default router;
