import mongoose, { Connection } from "mongoose";
import { logger } from "../utils/logger";
import { authConfig } from "./authConfig";
import dotenv from "dotenv"


dotenv.config()
export class DatabaseConnection {

    private connection: Connection | null = null;
    private isConnected: boolean = false;

    // Connect database
    async connect() {
        try {
            logger.info('Attempting to connect database...');
            const URI: string = process.env.MONGOD_URL || "mongodb://localhost:27017/mydb"
            const options: mongoose.ConnectOptions = {
                maxPoolSize: 10,                    // Maximum number of connections in the connection pool
                serverSelectionTimeoutMS: 5000,     // How long to try selecting a server
                socketTimeoutMS: 45000,             // How long to wait for a response
                bufferCommands: false,              // Disable mongoose buffering
                heartbeatFrequencyMS: 10000,        // How often to check server status
                retryWrites: true,                  // Retry writes on network errors
                retryReads: true,                   // Retry reads on network errors
                connectTimeoutMS: 30000,            // How long to wait for initial connection
            }

            await mongoose.connect(URI, options);
            this.connection = mongoose.connection;
            this.isConnected = true;

            logger.info("Successfully connected to the database");

            this.setUpEventsListener();
            return this.connection

        } catch (error: any) {
            logger.error("❌ Mongoose connection failed:", error.message);
            this.isConnected = false;
            throw error;
        }
    }


    // Setup event listner  
    private setUpEventsListener() {
        if (!this.connection) return;

        this.connection.on("connected", () => {
            console.log("🔄 Mongoose connected to DB");
            this.isConnected = true;
        });
        this.connection.on("disconnected", () => {
            console.log("🔌 Mongoose disconnected");
            this.isConnected = false;
        })
        this.connection.on("error", (error: any) => {
            console.error("❌ Mongoose connection error:", error.message);
            this.isConnected = false;
        })
        this.connection.on("reconnected", () => {
            console.log("♻️ Mongoose reconnected");
            this.isConnected = true;
        })
    }

    async disconnect() {
        if (this.connection && this.isConnected) {
            logger.info("closing mongoose connection...")
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info("closing mongoose connection...")
        }
    }

    getConnection(): Connection {
        if (!this.connection || !this.isConnected) {
            throw new Error("Database not connected. Call connect() first.");
        }
        return this.connection;
    }

    async isHealthy(): Promise<boolean> {
        try {
            if (!this.connection && !this.isConnected) return false;
            await this.connection?.db?.admin().command({ ping: 1 })
            return true;
        } catch (error: any) {
            logger.info("HEalth check failed", error.message);
            return false;
        }

    }

    async reconnect(maxReties = 5): Promise<boolean> {
        for (let attempt = 0; attempt <= maxReties; attempt++) {
            try {
                logger.info(`Reconnection Attempts ${attempt}/${maxReties}`);
                await this.connect();
                return true;
            } catch (error: any) {
                logger.error(`Reconnection attempt ${attempt} failed:`, error.message);
                if (attempt < maxReties) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
                    logger.info(`Waiting ${delay}ms before next attempt...`);
                    await new Promise((resolve) => setTimeout(resolve, delay))
                }
            }
        }
        return false;
    }
}


export const dbConnection = new DatabaseConnection()