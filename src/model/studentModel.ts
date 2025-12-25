import mongoose, { Document, Schema } from "mongoose";


export interface IStudent extends Document {
    firstName: string;
    middleName?: string;
    lastName: string;
    avatar?: string;
    rollNumber: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    guardianName?: string;
    contactNumber: string;
    classId: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};


export const studentSchema = new Schema<IStudent>({
    firstName: {
        type: String,
        trim: true,
        required: [true, "First name is required"],
        minlength: [2, "First name must be at least 2 characters long"],
        maxlength: [50, "First name cannot exceed 50 characters"]
    },
    middleName: {
        type: String,
        trim: true,
        maxlength: [50, "Middle name cannot exceed 50 characters"]
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, "Last name is required"],
        minlength: [2, "Last name must be at least 2 characters long"],
        maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    avatar: {
        type: String,
        trim: true,
        validate: {
            validator: function (v: string) {
                if (!v) return true; // Optional field
                // Basic URL validation
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
            },
            message: "Avatar must be a valid image URL"
        }
    },
    rollNumber: {
        type: String,
        required: [true, "Roll number is required"],
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[A-Z0-9]+$/, "Roll number must contain only alphanumeric characters"]
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [3, "Age must be at least 3 years"],
        max: [25, "Age cannot exceed 25 years"],
        validate: {
            validator: Number.isInteger,
            message: "Age must be a whole number"
        }
    },
    gender: {
        type: String,
        enum: {
            values: ["Male", "Female", "Other"],
            message: "Gender must be Male, Female, or Other"
        },
        required: [true, "Gender is required"]
    },
    guardianName: {
        type: String,
        trim: true,
        minlength: [2, "Guardian name must be at least 2 characters long"],
        maxlength: [100, "Guardian name cannot exceed 100 characters"]
    },
    contactNumber: {
        type: String,
        required: [true, "Contact number is required"],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid contact number"]
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: "Class",
        required: [true, "Class ID is required"]
    }
}, {
    timestamps: true,
});

// Index for better query performance
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ classId: 1 });

export const Students = mongoose.model("Students", studentSchema);