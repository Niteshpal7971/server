import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { IRefreshToken } from '../types/users.Types';

export const TokenUtils = {
    /**
     * Hash a plain token using SHA-256
     */
    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    },

    /**
     * Generate Access and Refresh tokens
     * Access Token: Short-lived (e.g., 15m)
     * Refresh Token: Long-lived (e.g., 7d)
     */
    generateTokens(user: { _id: string, email: string }) {
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '15m' } // Short-lived
        );

        // Random secure string for refresh token (opaque token)
        // Alternatively, it can be a signed JWT if we want stateless validity checks before DB
        // But requirements say "Store refresh token... HASHED". Opaque is better for revocation.
        const refreshToken = crypto.randomBytes(40).toString('hex');

        // We will store the hash of this refresh token in DB
        // Client gets the plain `refreshToken`

        return { accessToken, refreshToken, expiresIn: 15 * 60 }; // expiresIn seconds
    }
};
