import { Authservice } from "../services/authServices";
import { logger } from "../utils/logger";
import { Request, Response } from "express";


const authservices = new Authservice();

export class AuthController {

    async registerUser(req: Request, res: Response) {
        try {
            console.log("BODY TYPE:", typeof req.body, req.body);

            const register: any = await authservices.register(req.body);
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: register
            });
        } catch (error: any) {
            console.error("Error in register user", error.message);
            return res.status(400).json({
                success: false,
                message: error.message || "Registration failed"
            });
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const loginUser = await authservices.login(req.body);
            if (req.headers["user-agent"]?.includes("Mozilla")) {
                res.cookie("refreshToken", loginUser.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                });
                return res.status(201).json({ success: true, message: "User Loggedin", User: loginUser.accessToken });
            }

            return res.status(201).json({ success: true, message: "User Loggedin", User: loginUser });
        } catch (error: any) {
            console.error("Error in Login user", error.message);
            return res.status(400).json({
                success: false,
                message: error.message || "Login failed"
            });
        }
    }

}