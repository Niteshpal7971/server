// src/config/logger.ts
import { createLogger, format, transports, Logger as WinstonLogger } from "winston";

const { combine, timestamp, printf, colorize, errors, json } = format;

class Logger {
    private logger: WinstonLogger;

    constructor() {
        this.logger = createLogger({
            level: process.env.NODE_ENV === "production" ? "info" : "debug",
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                errors({ stack: true }), // agar error ho to stack trace bhi log karega
                process.env.NODE_ENV === "production"
                    ? json() // prod me JSON format (tools ke liye easy parsing)
                    : printf(({ level, message, timestamp, stack }) => {
                        return stack
                            ? `[${timestamp}] ${level}: ${message}\nStack: ${stack}`
                            : `[${timestamp}] ${level}: ${message}`;
                    })
            ),
            transports: [
                new transports.Console({
                    format: combine(colorize({ all: true }))
                }),
                new transports.File({
                    filename: "logs/error.log",
                    level: "error",
                }),
                new transports.File({
                    filename: "logs/combined.log",
                }),
            ],
            exceptionHandlers: [
                new transports.File({ filename: "logs/exceptions.log" }),
            ],
            rejectionHandlers: [
                new transports.File({ filename: "logs/rejections.log" }),
            ],
        });
    }

    public info(message: string, meta: object = {}) {
        this.logger.info(message, meta);
    }

    public error(message: string, meta: object = {}) {
        this.logger.error(message, meta);
    }

    public warn(message: string, meta: object = {}) {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta: object = {}) {
        this.logger.debug(message, meta);
    }
}

// singleton pattern → ek hi instance pura project use kare
export const logger = new Logger();
