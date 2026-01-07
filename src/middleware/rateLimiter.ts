import rateLimit from 'express-rate-limit';

export const authRateLimiter = {
    // Login Rate Limit: 5 attempts per 15 minutes
    login: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: { success: false, message: "Too many login attempts, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
    }),

    // Refresh Token Rate Limit: 10 attempts per 15 minutes (Allow for some retry/parallel issues but keep tight)
    refresh: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: { success: false, message: "Too many refresh attempts, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
    })
};
