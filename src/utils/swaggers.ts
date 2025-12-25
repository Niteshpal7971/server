import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Application } from "express";
import dotenv from "dotenv";

dotenv.config()

const PORT = process.env.PORT || 8000

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My Node.js + TS API",
            version: "1.0.0",
            description: "Production-ready API documentation",
        },
        tags: [
            { name: "Users", description: "User management endpoints" },
            { name: "Auth", description: "Authentication endpoints" }
        ],
        servers: [
            { url: `http://localhost:${PORT}`, description: "Local development server" }
        ],
        components: {
            securitySchemes: {
                Bearer: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT key authorization for API"
                },
                ApiKeyAuth: {
                    type: "apikey",
                    in: "header",
                    name: "x-api-key",
                    description: "API key authorization for API"
                }
            }
        }
    },
    apis: ["./routes/*.ts"]
}

const swaggerSpec = swaggerJsdoc(options);

require("swagger-model-validator")(swaggerSpec);
export const setupSwagger = (app: Application) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};