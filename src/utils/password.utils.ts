import bcrypt from "bcrypt"
import { authConfig } from "../config/authConfig"


export class PasswordUtils {
    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, authConfig.bcrypt.saltRounds)
    }

    static async verifyPassword(password: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword)
    }

    static ValidatePassword(password: string): { isValid: boolean, errors: string[] } {
        const errors: string[] = []
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}