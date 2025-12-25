import mongoose, { Schema } from "mongoose";


export const classSchema = new Schema(
    {
        className: {
            type: String,
            required: true
        },
        section: {
            type: String,
        },
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: "School"
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    })

classSchema.virtual("students", {
    ref: "Student",
    localField: "_id",
    foreignField: "classId"
})

export const Class = mongoose.model("Class", classSchema)