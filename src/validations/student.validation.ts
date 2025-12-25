// src/validators/student.validator.ts
import Joi from "joi";

export const createStudentSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    middleName: Joi.string().allow("", null).max(50),
    lastName: Joi.string().min(2).max(50).required(),
    avatar: Joi.string().uri().allow("", null),
    rollNumber: Joi.string().alphanum().uppercase().min(1).max(30).required(),
    age: Joi.number().integer().min(3).max(25).required(),
    gender: Joi.string().valid("Male", "Female", "Other").required(),
    guardianName: Joi.string().min(2).max(100).required(),
    contactNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
});

export const updateStudentSchema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    middleName: Joi.string().allow("", null).max(50),
    lastName: Joi.string().min(2).max(50),
    avatar: Joi.string().uri().allow("", null),
    rollNumber: Joi.string().alphanum().uppercase().min(1).max(30),
    age: Joi.number().integer().min(3).max(25),
    gender: Joi.string().valid("Male", "Female", "Other"),
    guardianName: Joi.string().min(2).max(100),
    contactNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
});
