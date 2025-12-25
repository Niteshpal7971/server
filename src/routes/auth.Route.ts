import { Router } from "express";
import { AuthController } from "../controller/authController";

const router = Router();
const authController = new AuthController()

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

export default router