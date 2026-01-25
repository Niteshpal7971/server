import { User } from "../model/userModel";
import { RefreshToken } from "../model/refreshToken.model";
import { AuthTokens, LoginRequest, IRefreshToken } from "../types/users.Types";
import { JwtUtils } from "../utils/jwt.utils"; // We might replace this with TokenUtils or use both. Let's use TokenUtils for generation.
// import { TokenUtils } from "../utils/token.utils";
import { logger } from "../utils/logger";
import { PasswordUtils } from "../utils/password.utils";
import mongoose from "mongoose";

interface DeviceInfo {
    deviceId: string;
    deviceType: 'WEB' | 'ANDROID';
    userAgent?: string;
    ipAddress?: string;
}

export class Authservice {

    // Login User
    async login(loginData: LoginRequest, deviceInfo: DeviceInfo): Promise<AuthTokens> {
        const { email, password } = loginData;

        // 1. Find user
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) throw new Error("Invalid credentials");
        if (user.isActive === false) throw new Error("User is deactivated");

        // 2. Verify password
        const isMatch = await PasswordUtils.verifyPassword(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        // 3. Generate tokens
        const { accessToken, refreshToken, expiresIn } = JwtUtils.generateToken(user._id as string, user.email);

        // 4. Hash refresh token
        // const tokenHash = TokenUtils.hashToken(refreshToken);

        // 5. Store Refresh Token with Device Info
        // Note: Requirements say "one refresh token per device". 
        // We should invalidate any existing active token for this SPECIFIC deviceId to enforce 1-per-device.
        await RefreshToken.deleteMany({ user: user._id, deviceId: deviceInfo.deviceId });

        await RefreshToken.create({
            user: user._id,
            tokenHash: refreshToken,
            deviceId: deviceInfo.deviceId,
            deviceType: deviceInfo.deviceType,
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // 6. Update last login
        user.lastLogin = new Date();
        await user.save();

        return { accessToken, refreshToken, expiresIn, user };
    }

    // Refresh Token (Rotation & Reuse Detection)
    async refreshToken(token: string, deviceInfo: Partial<DeviceInfo>): Promise<Partial<AuthTokens>> {
        // const tokenHash = TokenUtils.hashToken(rawRefreshToken);

        // 1. Try to find the token
        const existingToken = await RefreshToken.findOne({ tokenHash: token });

        // 2. Scenario: Token Not Found (Could be totally invalid or already rotated and deleted by TTL)
        // However, if we track "replacedBy", we usually keep old tokens for a while.
        // If we can't find it by hash, check if it matches a "replacedBy" (implies reuse of VERY old token? No, replacedBy is a property, not index).
        // Let's rely on finding by hash.

        if (!existingToken) {
            // Check if this tokenHash exists as a `replacedByTokenHash` in ANY document? 
            // That would be expensive efficiently without index. 
            // Simplified reuse detection: 
            // If the token is NOT found, we might treat it as "Invalid".
            // But if we find a token that is REVOKED, that's reuse.

            // To detect reuse of a token that was ALREADY rotated, we must validly find it in DB but marked as revoked.
            // So if `findOne` returns null, we just say "Invalid Token".
            // We can add a lookup for `replacedByTokenHash` if we want deep investigation, but 'revoked' flag is the standard way.

            // Wait, if I rotate Token A -> Token B. User sends Token A.
            // Token A should still be in DB, but `revoked: true`.

            // If user sends a completely made up token, we won't find it.

            // SO:
            const revokedToken = await RefreshToken.findOne({ tokenHash: token, revoked: true }); // Hmm, `tokenHash` is unique. 
            // If I do `findOne({ tokenHash })`, I get it regardless of revoked status.
        }

        // Refetching with just tokenHash to handle both cases
        const tokenDoc = await RefreshToken.findOne({ tokenHash: token });

        if (!tokenDoc) {
            // If we can't find the token, maybe it was deleted (TTL). 
            // Or it's a completely fake token.
            // Security-wise, distinct reuse detection is easiest if we keep the revoked token.
            // We do keep it (TTL is on expiresAt, which is 7 days).
            throw new Error("Invalid or Expired Refresh Token");
        }

        const user = await User.findById(tokenDoc.user);
        if (!user) throw new Error("User not found");

        // 3. Scenario: REUSE DETECTED
        if (tokenDoc.revoked) {
            logger.error(`[SECURITY] Refresh Token Reuse Detected! User: ${user.email}, Device: ${tokenDoc.deviceId}, IP: ${deviceInfo.ipAddress}`);

            // REVOKE ALL TOKENS FOR THIS USER
            await RefreshToken.deleteMany({ user: user._id });

            throw new Error("Security Alert: creating a new login is required.");
        }

        // 4. Scenario: Device Mismatch (Optional, but good for "Binding")
        if (tokenDoc.deviceId !== deviceInfo.deviceId) {
            // Suspicious: Token issued to Device A is being used by Device B
            logger.warn(`[SECURITY] Token Device Mismatch. Issued: ${tokenDoc.deviceId}, Used by: ${deviceInfo.deviceId}`);
            // We could block it. For now, let's just log or throw.
            // throw new Error("Invalid credentials"); 
            // (Strict binding)
        }

        // 5. Valid Rotation
        // Invalidate (Revoke) the current token
        tokenDoc.revoked = true;
        // Generate NEW tokens
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = JwtUtils.generateToken(user._id as string, user.email);
        // const newTokenHash = TokenUtils.hashToken(newRefreshToken);

        tokenDoc.replacedByTokenHash = newRefreshToken;
        await tokenDoc.save();

        // Create NEW RefreshToken record
        await RefreshToken.create({
            user: user._id,
            tokenHash: newRefreshToken,
            deviceId: tokenDoc.deviceId, // Bind to same device
            deviceType: tokenDoc.deviceType,
            userAgent: deviceInfo.userAgent || tokenDoc.userAgent,
            ipAddress: deviceInfo.ipAddress || tokenDoc.ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return { accessToken, refreshToken: newRefreshToken, expiresIn };
    }

    // Logout (Single Device)
    async logout(refreshToken: string) {
        // const tokenHash = TokenUtils.hashToken(refreshToken);
        await RefreshToken.deleteOne({ tokenHash: refreshToken });
    }

    // Logout All Devices
    async logoutAll(userId: string) {
        await RefreshToken.deleteMany({ user: userId });
    }

    // Registration (Keeping existing registration logic but cleaning up)
    async register(userData: { name: string, email: string, password: string }): Promise<any> {
        console.log("user Data", userData)
        const { name, email, password } = userData;

        const validatePassword = PasswordUtils.ValidatePassword(password);
        if (!validatePassword.isValid) throw new Error(validatePassword.errors.join(', '));

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) throw new Error("User already exists");

        const hashPassword = await PasswordUtils.hashPassword(password);
        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            isActive: true,
            lastLogin: new Date()
        });
        return newUser;
    }
}