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
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}