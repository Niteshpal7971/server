import mongoose, { Schema, Document, Model } from "mongoose";
import { Blocklist } from "../types/users.Types"


export interface IBlockList extends Document, Blocklist { }
const blacklistedTokenSchema: Schema<IBlockList> = new mongoose.Schema(
    {
        jti: { type: String, required: true, unique: true },
        exp: { type: Number, required: true }, // token expiry timestamp

    }, { timestamps: true }
);

export const BlacklistedToken: Model<IBlockList> = mongoose.model<IBlockList>("BlacklistedToken", blacklistedTokenSchema);
