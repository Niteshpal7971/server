import { Algorithm } from "jsonwebtoken"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"


dotenv.config()


interface JwtConfig {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string | number; // e.g. "15m" or 900
    refreshTokenExpiry: string | number; // e.g. "7d"
    algorithm: jwt.Algorithm; // e.g. "HS256"
    issuer: string;
    audience: string;
}

interface BcryptConfig {
    saltRounds: number;
}

interface RedisConfig {
    url: string;
    keyPrefix: string;
}

export const authConfig: { jwt: JwtConfig, bcrypt: BcryptConfig, redis: RedisConfig } = {
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
        algorithm: (process.env.JWT_ALGORITHM || 'HS256') as Algorithm,
        issuer: process.env.JWT_ISSUER || 'your-app',
        audience: process.env.JWT_AUDIENCE || 'your-app-users',
    },
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'auth:',
    },
}

const requiredEnvVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGOD_URL',
    'REDIS_URL',
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is not set`)
    }
}