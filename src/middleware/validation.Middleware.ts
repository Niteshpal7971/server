import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateFields = (validator: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = validator.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            const errors = error.details.map((detail: any) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));

            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }

        req.body = value;
        next();
    };
};

export const validateQuery = (validator: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = validator.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            const errors = error.details.map((detail: any) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
        }
        req.body = value;
        next();
    };
};
