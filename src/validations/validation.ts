import Joi from "joi";
import { Role } from "../types/users.Types";


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,128}$/;

// Register and create User
export const createSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ tlds: { allow: true } }).required(),
    password: Joi.string().min(6).max(30).pattern(passwordRegex)
        .required()
        .messages({
            "string.pattern.base": `Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 special character`,
            "string.min": `Password should have minimum 8 characters`,
            "string.max": `Password should have maximum 128 characters`,
            "any.required": `Password is required`,
        }),
    role: Joi.string().valid(...Object.values(Role)).optional()
});

// update user
export const updateSchema = Joi.object({
    name: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email({ tlds: { allow: true } }).optional(),
    password: Joi.string().min(6).max(30).pattern(passwordRegex)
        .required()
        .messages({
            "string.pattern.base": `Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 special character`,
            "string.min": `Password should have minimum 8 characters`,
            "string.max": `Password should have maximum 128 characters`,
            "any.required": `Password is required`,
        }).optional(),
    role: Joi.string().valid(...Object.values(Role)).optional()
});


export const createStudentValidator = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name cannot exceed 50 characters',
            'string.pattern.base': 'First name must contain only letters and spaces',
            'any.required': 'First name is required'
        }),

    middleName: Joi.string()
        .max(50)
        .trim()
        .optional()
        .allow('')
        .pattern(/^[a-zA-Z\s]*$/)
        .messages({
            'string.max': 'Middle name cannot exceed 50 characters',
            'string.pattern.base': 'Middle name must contain only letters and spaces'
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name cannot exceed 50 characters',
            'string.pattern.base': 'Last name must contain only letters and spaces',
            'any.required': 'Last name is required'
        }),

    avatar: Joi.string()
        .uri()
        .optional()
        .allow('')
        .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
        .messages({
            'string.uri': 'Avatar must be a valid URL',
            'string.pattern.base': 'Avatar must be a valid image file (jpg, jpeg, png, gif, webp)'
        }),

    rollNumber: Joi.string()
        .required()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9]+$/)
        .min(3)
        .max(20)
        .messages({
            'string.empty': 'Roll number is required',
            'string.pattern.base': 'Roll number must contain only alphanumeric characters',
            'string.min': 'Roll number must be at least 3 characters long',
            'string.max': 'Roll number cannot exceed 20 characters',
            'any.required': 'Roll number is required'
        }),

    age: Joi.number()
        .integer()
        .min(3)
        .max(25)
        .required()
        .messages({
            'number.base': 'Age must be a number',
            'number.integer': 'Age must be a whole number',
            'number.min': 'Age must be at least 3 years',
            'number.max': 'Age cannot exceed 25 years',
            'any.required': 'Age is required'
        }),

    gender: Joi.string()
        .valid('Male', 'Female', 'Other')
        .required()
        .messages({
            'any.only': 'Gender must be Male, Female, or Other',
            'any.required': 'Gender is required'
        }),

    guardianName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .optional()
        .allow('')
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.min': 'Guardian name must be at least 2 characters long',
            'string.max': 'Guardian name cannot exceed 100 characters',
            'string.pattern.base': 'Guardian name must contain only letters and spaces'
        }),

    contactNumber: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .required()
        .messages({
            'string.pattern.base': 'Please enter a valid contact number',
            'string.empty': 'Contact number is required',
            'any.required': 'Contact number is required'
        }),

    classId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Class ID must be a valid MongoDB ObjectId',
            'string.empty': 'Class ID is required',
            'any.required': 'Class ID is required'
        })
});


// Student validator
export const updateStudentValidator = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .optional()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name cannot exceed 50 characters',
            'string.pattern.base': 'First name must contain only letters and spaces'
        }),

    middleName: Joi.string()
        .max(50)
        .trim()
        .optional()
        .allow('')
        .pattern(/^[a-zA-Z\s]*$/)
        .messages({
            'string.max': 'Middle name cannot exceed 50 characters',
            'string.pattern.base': 'Middle name must contain only letters and spaces'
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .optional()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name cannot exceed 50 characters',
            'string.pattern.base': 'Last name must contain only letters and spaces'
        }),

    avatar: Joi.string()
        .uri()
        .optional()
        .allow('')
        .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
        .messages({
            'string.uri': 'Avatar must be a valid URL',
            'string.pattern.base': 'Avatar must be a valid image file (jpg, jpeg, png, gif, webp)'
        }),

    rollNumber: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9]+$/)
        .min(3)
        .max(20)
        .optional()
        .messages({
            'string.pattern.base': 'Roll number must contain only alphanumeric characters',
            'string.min': 'Roll number must be at least 3 characters long',
            'string.max': 'Roll number cannot exceed 20 characters'
        }),

    age: Joi.number()
        .integer()
        .min(3)
        .max(25)
        .optional()
        .messages({
            'number.base': 'Age must be a number',
            'number.integer': 'Age must be a whole number',
            'number.min': 'Age must be at least 3 years',
            'number.max': 'Age cannot exceed 25 years'
        }),

    gender: Joi.string()
        .valid('Male', 'Female', 'Other')
        .optional()
        .messages({
            'any.only': 'Gender must be Male, Female, or Other'
        }),

    guardianName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .optional()
        .allow('')
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.min': 'Guardian name must be at least 2 characters long',
            'string.max': 'Guardian name cannot exceed 100 characters',
            'string.pattern.base': 'Guardian name must contain only letters and spaces'
        }),

    contactNumber: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid contact number'
        }),

    classId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Class ID must be a valid MongoDB ObjectId'
        })
});

export const studentQueryValidator = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    classId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    minAge: Joi.number().integer().min(3).max(25).optional(),
    maxAge: Joi.number().integer().min(3).max(25).optional(),
    sortBy: Joi.string().valid('firstName', 'lastName', 'rollNumber', 'age', 'createdAt', 'updatedAt').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
}).custom((value, helpers) => {
    // Custom validation to ensure minAge <= maxAge
    if (value.minAge && value.maxAge && value.minAge > value.maxAge) {
        return helpers.error('custom.ageRange', {
            message: 'Minimum age cannot be greater than maximum age'
        });
    }
    return value;
});


export const validateStudent = (validator: Joi.ObjectSchema) => {
    return (req: any, res: any, next: any) => {
        const { error, value } = validator.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errors = error.details.map((detail: any) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        req.body = value;
        next();
    };
};

export const validateStudentQuery = (validator: Joi.ObjectSchema) => {
    return (req: any, res: any, next: any) => {
        const { error, value } = validator.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errors = error.details.map((detail: any) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Query validation failed',
                errors
            });
        }

        req.query = value;
        next();
    };
};