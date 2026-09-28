import { OAuth2Client, CodeChallengeMethod } from 'google-auth-library';
import * as userRepository from '../repository/user.repository.js';
import { google as googleConfig } from '../config/index.js';

const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

// Role given to every new Google account. Fixed server-side, never taken from the client.
const GOOGLE_DEFAULT_ROLE = 'VICTIM';

const client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret, googleConfig.callbackUrl);

/**
 * Build the Google authorization URL (Authorization Code flow + PKCE S256)
 */
export const buildAuthUrl = ({ state, codeChallenge }) => {
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        state,
        code_challenge_method: CodeChallengeMethod.S256,
        code_challenge: codeChallenge,
        prompt: 'select_account',
    });
};

/**
 * Exchange the authorization code for tokens (server-side, uses the client secret)
 */
export const getTokens = async ({ code, codeVerifier }) => {
    const { tokens } = await client.getToken({ code, codeVerifier, redirect_uri: googleConfig.callbackUrl });
    return tokens;
};

/**
 * Verify the ID token (signature, aud, exp via the library; iss + email_verified here)
 */
export const verifyIdToken = async (idToken) => {
    const ticket = await client.verifyIdToken({ idToken, audience: googleConfig.clientId });
    const payload = ticket.getPayload();

    if (!payload || !GOOGLE_ISSUERS.includes(payload.iss) || payload.email_verified !== true) {
        const error = new Error('Invalid Google ID token');
        error.statusCode = 401;
        throw error;
    }

    return payload;
};

/**
 * Find the user for a verified Google identity, linking or creating as needed
 */
export const findOrCreateGoogleUser = async (payload) => {
    const email = payload.email.toLowerCase();

    const denied = () => {
        const error = new Error('Account is not permitted to sign in');
        error.statusCode = 401;
        return error;
    };

    let user = (await userRepository.findByGoogleId(payload.sub)) || (await userRepository.findByEmail(email));

    if (user) {
        // Deactivated accounts, or an email already linked to a different Google account
        if (!user.isActive || (user.googleId && user.googleId !== payload.sub)) {
            throw denied();
        }

        // Existing local account with the same verified email: link it, keep its role
        if (!user.googleId) {
            user = await userRepository.updateById(user._id, { googleId: payload.sub });
        }
    } else {
        user = await userRepository.create({
            name: payload.name || email.split('@')[0],
            email,
            role: GOOGLE_DEFAULT_ROLE,
            authProvider: 'GOOGLE',
            googleId: payload.sub,
            isActive: true,
        });
    }

    await userRepository.updateLastLogin(user._id);

    return user;
};
