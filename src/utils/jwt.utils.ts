import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid";
import { authConfig } from "../config/authConfig"
import { BlacklistedToken } from "../model/blockListModel"
import { logger } from "./logger";
import { TokenPayload, AuthTokens } from "../types/users.Types";

// setInterval(async () => {
//   await BlacklistedToken.deleteMany({ exp: { $lt: Math.floor(Date.now() / 1000) } });
// }, 1000 * 60 * 60); // har 1 ghante me


export class JwtUtils {
    static generateToken(userId: string, email: string): AuthTokens {
        const jti = uuidv4();

        const accessTokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
            userId,
            email,
            jti
        }

        const accessToken = jwt.sign(
            accessTokenPayload,
            authConfig.jwt.accessTokenSecret,
            {
                expiresIn: authConfig.jwt.accessTokenExpiry as any,
                algorithm: authConfig.jwt.algorithm,
                issuer: authConfig.jwt.issuer,
                audience: authConfig.jwt.audience,
            }
        )

        const refreshToken = jwt.sign(
            { userId, jti },
            authConfig.jwt.refreshTokenSecret,
            {
                expiresIn: authConfig.jwt.refreshTokenExpiry as any,
                algorithm: authConfig.jwt.algorithm,
                issuer: authConfig.jwt.issuer,
                audience: authConfig.jwt.audience
            }
        )

        // get expiration types in second
        const decode = jwt.decode(refreshToken) as TokenPayload;
        const expiresIn = decode.exp - Math.floor(Date.now() / 1000);

        return {
            accessToken,
            refreshToken,
            expiresIn
        }
    }

    static async verifyAccessToken(token: string): Promise<TokenPayload> {
        try {

            logger.info("Verifying Access Token...")

            const payload = jwt.verify(
                token,
                authConfig.jwt.accessTokenSecret,
                {
                    algorithms: [authConfig.jwt.algorithm],
                    issuer: authConfig.jwt.issuer,
                    audience: authConfig.jwt.audience
                }
            ) as TokenPayload;

            // check if token is blacklisted

            const isBlackListed = await BlacklistedToken.findOne({ jti: payload.jti });
            if (isBlackListed) {
                logger.warn(`Blocklisted token detected. jti:${payload.jti}`)
            }

            return payload
        } catch (error: any) {
            logger.error(`Token verification failed ${error.message} `);
            throw new Error("Invalid or expired token");
        }
    }

    static async verifyRefreshToken(token: string): Promise<{ userId: string, jti: string }> {
        try {
            const payload = jwt.verify(
                token,
                authConfig.jwt.refreshTokenSecret,
                {
                    algorithms: [authConfig.jwt.algorithm],
                    issuer: authConfig.jwt.issuer,
                    audience: authConfig.jwt.audience,
                }
            ) as { userId: string, jti: string }

            // check if token is blacklisted
            const isBlackListed = await BlacklistedToken.findOne({ jti: payload.jti });
            if (isBlackListed) {
                logger.warn(`Refreshtoken token detected. jti:${payload.jti}`)
            }

            return payload;
        } catch (error: any) {
            logger.error(`Refreshtoken verification failed ${error.message}`);
            throw new Error("Invalid or expired token");
        }

    }
}