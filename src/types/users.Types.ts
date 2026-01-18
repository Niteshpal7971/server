export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    PUBLIC = "PUBLIC",
}

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role?: Role;
    isActive?: boolean;
    isAdmin?: boolean;
    lastLogin?: Date
};

export interface Blocklist {
    jti: string;
    exp: number;
}

export interface TokenPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
    jti: string; // JWT ID for blacklisting
    aud?: string;
    iss?: string
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user?: IUser
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface IRefreshToken {
    user: string;
    tokenHash: string;
    deviceId: string;
    deviceType: 'WEB' | 'ANDROID';
    userAgent: string;
    ipAddress: string;
    expiresAt: Date;
    revoked: boolean;
    replacedByTokenHash?: string;
    createdAt: Date;
}
