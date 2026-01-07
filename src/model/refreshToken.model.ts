import mongoose, { Schema, Document } from "mongoose";
import { IRefreshToken } from "../types/users.Types";

export interface IRefreshTokenDocument extends Omit<IRefreshToken, "user">, Document {
    user: mongoose.Types.ObjectId;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true }, // Store HASHED token
    deviceId: { type: String, required: true },
    deviceType: { type: String, enum: ["WEB", "ANDROID"], required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    revoked: { type: Boolean, default: false },
    replacedByTokenHash: { type: String }, // For rotation chains
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

// TTL Index: Auto-delete expired documents
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster lookups during login/refresh
RefreshTokenSchema.index({ user: 1, deviceId: 1 });

export const RefreshToken = mongoose.model<IRefreshTokenDocument>("RefreshToken", RefreshTokenSchema);
