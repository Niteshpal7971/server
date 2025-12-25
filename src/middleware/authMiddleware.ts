import { JwtUtils } from "../utils/jwt.utils";
import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../types/users.Types";

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            USER?: TokenPayload
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split('')[1];

        if (!token) {
            logger.warn("Access token missing in request", {
                path: req.path,
                method: req.method,
                ip: req.ip,
            });
            res.status(401).json({ error: "Access token required" });
            return;
        }

        const decode = await JwtUtils.verifyAccessToken(token);
        req.USER = decode;
    } catch (error: any) {
        logger.error(`authentication error ${error.message}`);
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}