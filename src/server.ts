import { dbConnection } from "./config/db";
import { logger } from "./utils/logger";
import app from "./app";
import dotenv from "dotenv"


dotenv.config();
const PORT = process.env.PORT;
let server: any;

const startServer = async () => {
    try {
        logger.info("server starting...");
        // 1. Database connect with retry mechanism
        const connected = await dbConnection.reconnect(5);
        if (!connected) {
            logger.error("Could not estabilished connection after retries. Exiting...");
            process.exit(1);
        }
        // 2. Health check before starting server
        const isHealthy = await dbConnection.isHealthy();
        if (!isHealthy) {
            logger.error("Database is not healthy. Exiting...")
        }
        // 3. Start express app
        server = app.listen(PORT, () => {
            logger.info(`server running at port ${PORT}`);
        })
        // 4. Handle uncaught errors
        process.on("uncaughtException", (err: any) => {
            logger.error("Uncaught Exception", err)
            shutDown("Uncaught Exception", 1)
        })

        process.on("unhandledRejection", (reason: any) => {
            logger.error("Unhandled Rejection", reason)
            shutDown("Unhandled Rejection", 1)
        })
        // 5. Graceful shutdown signals
        process.on("SIGINT", () => shutDown("SIGINT", 0))
        process.on("SIGTERM", () => shutDown("SIGTERM", 0))
    } catch (error: any) {
        logger.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

const shutDown = async (signal: string, code: number) => {
    logger.info(`\n Shutting down due to ${signal}...`);
    if (server) {
        server.close(() => {
            logger.info("server close...")
        })
    }

    try {
        await dbConnection.disconnect()
        logger.info("Database disconnected")
    } catch (error: any) {
        logger.error("Error during Database disconnect", error.message)
    }
    process.exit(1)
}

startServer();