import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser, Role } from "../types/users.Types";

export interface IuserDocuments extends IUser, Document { }
const userSchema: Schema<IuserDocuments> = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.USER
        }
    }
    , { timestamps: true })

export const User: Model<IuserDocuments> = mongoose.model<IuserDocuments>('User', userSchema) 
