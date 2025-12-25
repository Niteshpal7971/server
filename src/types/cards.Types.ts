// import mongoose, { Document } from "mongoose";

// export interface ISchool extends Document {
//     schoolName: string;
//     address: string;
//     createdBy: mongoose.Types.ObjectId;
// }

// export interface IClass extends Document {
//     className: string;
//     section?: string;
//     schoolId: mongoose.Types.ObjectId;
// }
// export interface Istudents extends Document {
//     firstName: string;
//     middleName: string;
//     lastName: string;
//     rollNumber: string;
//     age?: number;
//     gender?: "Male" | "Female" | "Other";
//     guardianName?: string;
//     contactNumber?: number;
//     classId: mongoose.Types.ObjectId;
// }

// types.ts

import { InferSchemaType } from "mongoose";
import { schoolSchema } from "../model/school.Model";
import { classSchema } from "../model/classModel";
import { studentSchema } from "../model/studentModel";

// Ab yeh types schema se automatically banenge
export type ISchool = InferSchemaType<typeof schoolSchema>;
export type IClass = InferSchemaType<typeof classSchema>;
export type IStudent = InferSchemaType<typeof studentSchema>;

// Optional: agar aapko _id access karna ho
export type WithId<T> = T & { _id: import("mongoose").Types.ObjectId };



// school types
export interface CreateSchoolRequest {
    schoolName: string;
    address: string;
    createdBy: string;
}

export interface UpdateSchoolRequest {
    schoolName?: string;
    address?: string;
    createdBy?: string;
}

export interface SchoolQuery {
    page?: number;
    limit?: number;
    search?: string;
    createdBy?: string;
    sortBy?: 'schoolName' | 'address' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    includeClasses?: boolean;
}

export interface BulkCreateSchoolRequest {
    schools: Omit<CreateSchoolRequest, 'createdBy'>[];
    createdBy: string;
}

export interface SchoolResponse {
    success: boolean;
    message?: string;
    data?: any;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalSchools: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit?: number;
    };
    errors?: Array<{
        field: string;
        message: string;
    }>;
}
