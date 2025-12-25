import { TokenBucket } from "../utils/limiter";
import { logger } from "../utils/logger";
import { RequestHandler } from "express";


const userBucket = new Map<string, TokenBucket>();

export const rateLimiter: RequestHandler = (req, res, next) => {
    const ip = req.ip || "unknown";  // User ka IP nikal liya

    if (!userBucket.has(ip)) {
        // Agar pehli baar request aa rahi hai to us IP ke liye ek naya bucket banao
        // yaha max 5 request burst allow hai, sustain rate = 1 token/sec
        userBucket.set(ip, new TokenBucket(5, 1))
    }

    // Us IP ka bucket le lo
    const bucket = userBucket.get(ip)!;


    // Check karo ki token available hai ki nahi
    if (bucket.allowRequest()) {
        logger.info("Request allowed", {
            route: req.originalUrl,
            method: req.method,
            ip
        });
        next();  //Request allow kar do
    } else {
        logger.warn("Rate limit exceeded", {
            route: req.originalUrl,
            method: req.method,
            ip
        });
        res.status(429).json({ message: "Too many request" })
    }
}