import { authConfig } from "../config/authConfig";
import { User } from "../model/userModel";
import { BlacklistedToken } from "../model/blockListModel";
import { AuthTokens, IUser, LoginRequest } from "../types/users.Types"
import { JwtUtils } from "../utils/jwt.utils"
import { logger } from "../utils/logger"
import { PasswordUtils } from "../utils/password.utils"

class DatabaseServices {
    async findUserByEmail(email: string): Promise<IUser | null> {
        try {
            return await User.findOne({ email })
        } catch (error: any) {
            logger.error("Error finding User by email", error.message);
            throw new Error("Error finding User by email", error.message)
        }
    }
    async findUserById(id: string) {

    }
    async createUser(userData: Partial<IUser>) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error: any) {
            logger.error("Error creating user", error.message);
            throw new Error("Error creating user");
        }
    }
    async updateUserLastLogin(id: string) { }

    async saveRefreshToken(refToken: any) {
        try {
            const token = new BlacklistedToken(refToken);
            return await token.save();
        } catch (error: any) {
            logger.error("Error saving token", error.message);
            throw new Error("Error Saving token");
        }
    }
}

export class Authservice {
    private db = new DatabaseServices();

    // Register User
    async register(userData: { name: string, email: string, password: string }): Promise<IUser | unknown> {

        const { name, email, password } = userData;
        console.log(name, email, password)
        //validate password
        const validatePassword = PasswordUtils.ValidatePassword(password);
        console.log(validatePassword, "validatedPassword")

        if (!validatePassword.isValid) {
            logger.error(`passord validation is failed ${validatePassword.errors.join(', ')}`)
            throw new Error(`passord validation is failed ${validatePassword.errors.join(', ')}`)
        }

        // check exist
        const existingUser = await this.db.findUserByEmail(email.toLocaleLowerCase());
        if (existingUser) {
            logger.error(`User is already exist`);
            throw new Error("User is already existed")
        }

        // hash password
        const hashPassword = await PasswordUtils.hashPassword(password)
        // create User
        const newUser = await this.db.createUser({
            name,
            email,
            password: hashPassword,
            isActive: true,
            lastLogin: new Date()
        });

        console.log(newUser, "newUser")

        return newUser;
    }

    // Login User
    async login(loginData: LoginRequest): Promise<AuthTokens> {
        const { email, password } = loginData;

        // find user in db
        const user = await this.db.findUserByEmail(email.toLocaleLowerCase());
        if (!user) {
            throw new Error("User not found")
        }

        // Check if user is active 
        if (user?.isActive) {
            throw new Error("User is deactivated")
        }

        // verify password
        const verifyPassword = await PasswordUtils.verifyPassword(password, user.password);
        if (!verifyPassword) {
            throw new Error(`Invalid password`)
        }

        // Generate Token 
        const tokens = JwtUtils.generateToken(user._id || "", user.email)
        //update last login

        await this.db.updateUserLastLogin(user?._id || "")

        //set refresh Token in db
        await this.db.saveRefreshToken({
            jti: tokens.refreshToken,
            exp: tokens.expiresIn
        });

        // return token
        return tokens
    }

    // refresh Token


}