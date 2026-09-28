import crypto from 'crypto';
import * as oauthService from '../services/oauth.service.js';
import { generateToken } from '../services/auth.service.js';
import logger from '../utils/logger.js';

const OAUTH_COOKIE = 'g_oauth';

const cookieOptions = {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/v1/auth/google',
};

// FRONTEND_URL may be a comma-separated allowlist (see app.js CORS); redirect to the first entry
const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

const base64url = (buffer) => buffer.toString('base64url');

/**
 * @route   GET /api/v1/auth/google
 * @desc    Start "Sign in with Google" (OIDC Authorization Code + PKCE)
 * @access  Public
 */
export const startGoogleAuth = (req, res) => {
    const state = base64url(crypto.randomBytes(32));
    const codeVerifier = base64url(crypto.randomBytes(32)); // 43 chars (RFC 7636)
    const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());

    res.cookie(OAUTH_COOKIE, JSON.stringify({ state, codeVerifier }), { ...cookieOptions, maxAge: 600000 });
    res.redirect(oauthService.buildAuthUrl({ state, codeChallenge }));
};

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google redirect target: verify state, exchange code, issue app JWT
 * @access  Public
 */
export const googleCallback = async (req, res) => {
    const stored = req.signedCookies?.[OAUTH_COOKIE];
    res.clearCookie(OAUTH_COOKIE, cookieOptions);

    try {
        const { code, state } = req.query;
        const { state: expectedState, codeVerifier } = stored ? JSON.parse(stored) : {};

        // CSRF protection: state must match the value bound to this browser
        if (
            typeof code !== 'string' ||
            typeof state !== 'string' ||
            typeof expectedState !== 'string' ||
            state.length !== expectedState.length ||
            !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))
        ) {
            throw new Error('OAuth state mismatch or missing code');
        }

        const tokens = await oauthService.getTokens({ code, codeVerifier });
        const payload = await oauthService.verifyIdToken(tokens.id_token);
        const user = await oauthService.findOrCreateGoogleUser(payload);

        const token = generateToken(user);

        // Token in the URL fragment so it is never sent to servers or written to access logs
        res.redirect(`${frontendUrl()}/oauth/callback#token=${encodeURIComponent(token)}`);
    } catch (error) {
        logger.warn(`Google sign-in failed: ${error.message}`);
        res.redirect(`${frontendUrl()}/login?error=oauth`);
    }
};
