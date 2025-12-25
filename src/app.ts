import express, { Application, Request, Response } from "express";
import { rateLimiter } from "./middleware/rateLimitter";
import { logger } from "./utils/logger"
import { setupSwagger } from "./utils/swaggers";
import cookieParser from "cookie-parser"
import cors from "cors";
import router from "./routes/index";


const app: Application = express();



setupSwagger(app);
// Middleware
app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
app.use(rateLimiter);
app.use("/api", router);

// Routes
app.get("/", (req: Request, res: Response) => {
    logger.info("Root endpoint hit", { route: "/", method: "GET" });
    res.send("Hello from Node.js + TypeScript backend!");
});


export default app