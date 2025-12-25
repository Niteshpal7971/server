import Joi from "joi";


export const createSchoolValidator = Joi.object({
    schoolName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .pattern(/^[a-zA-Z0-9\s\-'\.]+$/)
        .messages({
            'string.empty': 'School name is required',
            'string.min': 'School name must be at least 2 characters long',
            'string.max': 'School name cannot exceed 100 characters',
            'string.pattern.base': 'School name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods',
            'any.required': 'School name is required'
        }),

    address: Joi.string()
        .min(10)
        .max(500)
        .trim()
        .required()
        .messages({
            'string.empty': 'Address is required',
            'string.min': 'Address must be at least 10 characters long',
            'string.max': 'Address cannot exceed 500 characters',
            'any.required': 'Address is required'
        }),

    createdBy: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Created by must be a valid MongoDB ObjectId',
            'string.empty': 'Created by user ID is required',
            'any.required': 'Created by user ID is required'
        })
});

export const updateSchoolValidator = Joi.object({
    schoolName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .optional()
        .pattern(/^[a-zA-Z0-9\s\-'\.]+$/)
        .messages({
            'string.min': 'School name must be at least 2 characters long',
            'string.max': 'School name cannot exceed 100 characters',
            'string.pattern.base': 'School name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods'
        }),

    address: Joi.string()
        .min(10)
        .max(500)
        .trim()
        .optional()
        .messages({
            'string.min': 'Address must be at least 10 characters long',
            'string.max': 'Address cannot exceed 500 characters'
        }),

    createdBy: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Created by must be a valid MongoDB ObjectId'
        })
});

export const schoolQueryValidator = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),

    search: Joi.string()
        .trim()
        .optional()
        .allow('')
        .max(100)
        .messages({
            'string.max': 'Search term cannot exceed 100 characters'
        }),

    createdBy: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Created by must be a valid MongoDB ObjectId'
        }),

    sortBy: Joi.string()
        .valid('schoolName', 'address', 'createdAt', 'updatedAt')
        .optional()
        .default('createdAt')
        .messages({
            'any.only': 'Sort by must be one of: schoolName, address, createdAt, updatedAt'
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
        .messages({
            'any.only': 'Sort order must be either asc or desc'
        }),

    includeClasses: Joi.boolean()
        .optional()
        .default(false)
        .messages({
            'boolean.base': 'Include classes must be a boolean value'
        })
});

// Bulk operations validator
export const bulkSchoolValidator = Joi.object({
    schools: Joi.array()
        .items(createSchoolValidator.fork(['createdBy'], (schema) => schema.optional()))
        .min(1)
        .max(50)
        .required()
        .messages({
            'array.min': 'At least one school is required',
            'array.max': 'Cannot process more than 50 schools at once',
            'any.required': 'Schools array is required'
        }),

    createdBy: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Created by must be a valid MongoDB ObjectId',
            'any.required': 'Created by user ID is required'
        })
});