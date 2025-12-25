import mongoose, { Schema, Document } from "mongoose";


export interface ISchool extends Document {
    schoolName: string;
    address: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    // Virtual field for populated classes
    classes?: mongoose.Types.ObjectId[];
}

export const schoolSchema = new Schema<ISchool>(
    {
        schoolName: {
            type: String,
            required: [true, "School name is required"],
            trim: true,
            minlength: [2, "School name must be at least 2 characters long"],
            maxlength: [100, "School name cannot exceed 100 characters"],
            validate: {
                validator: function (v: string) {
                    // Allow letters, numbers, spaces, hyphens, and apostrophes
                    return /^[a-zA-Z0-9\s\-'\.]+$/.test(v);
                },
                message: "School name contains invalid characters"
            }
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [10, "Address must be at least 10 characters long"],
            maxlength: [500, "Address cannot exceed 500 characters"]
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Created by user ID is required"],
            validate: {
                validator: function (v: mongoose.Types.ObjectId) {
                    return mongoose.Types.ObjectId.isValid(v);
                },
                message: "Created by must be a valid user ID"
            }
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

// Virtual field for classes
schoolSchema.virtual("classes", {
    ref: "Class",
    localField: "_id",
    foreignField: "schoolId"
});

// Indexes for better query performance
schoolSchema.index({ schoolName: 1 });
schoolSchema.index({ createdBy: 1 });
schoolSchema.index({ createdAt: -1 });

// Compound index for unique school names per creator (if needed)
schoolSchema.index({ schoolName: 1, createdBy: 1 }, { unique: true });

// Pre-save middleware to format school name
schoolSchema.pre('save', function (next) {
    if (this.schoolName) {
        // Capitalize first letter of each word
        this.schoolName = this.schoolName
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    next();
});


export const School = mongoose.model('School', schoolSchema);