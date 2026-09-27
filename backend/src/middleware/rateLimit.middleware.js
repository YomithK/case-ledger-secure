import { rateLimit, MemoryStore } from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const loginStore = new MemoryStore();
const registerStore = new MemoryStore();

const rateLimitHandler = (req, res, next, options) =>
    res.status(options.statusCode).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
    });

/**
 * Brute-force protection for POST /auth/login.
 * Only failed attempts count, so legitimate users are not locked out.
 */
export const loginLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: loginStore,
    handler: rateLimitHandler,
});

/**
 * Throttle account creation on POST /auth/register.
 */
export const registerLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: registerStore,
    handler: rateLimitHandler,
});

/**
 * Clear all auth rate-limit counters (used by the test suite).
 */
export const resetAuthRateLimits = () => {
    loginStore.resetAll();
    registerStore.resetAll();
};
