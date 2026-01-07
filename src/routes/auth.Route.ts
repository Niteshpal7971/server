import { Router } from "express";
import { AuthController } from "../controller/authController";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();
const authController = new AuthController()

// Register
router.post("/register", authController.registerUser);

// Login (with Rate Limit)
router.post("/login", authRateLimiter.login, authController.loginUser);

// Refresh Token (with Rate Limit) - Handles Rotation & Security
router.post("/refresh-token", authRateLimiter.refresh, authController.refreshToken);

// Logout
router.post("/logout", authController.logout);

// Logout All Devices (Optional: Protect with Auth Middleware if available)
router.post("/logout-all", authController.logoutAll);

export default router;