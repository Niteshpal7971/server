import { logger } from "../utils/logger";
import { Class } from "../model/classModel";
import { IClass } from "../types/cards.Types";
import mongoose, { HydratedDocument } from "mongoose";
import { StudentServices } from "./studentServices";
import { ApiError } from "../utils/ApiError";

export class ClassDatabaseService {
    async createClass(data: Partial<IClass>): Promise<HydratedDocument<IClass>> {
        try {
            return await Class.create(data);
        } catch (error: any) {
            logger.error("Error creating Class: " + error.message);
            throw new ApiError(500, "Error creating Class: " + error.message);
        }
    }

    async findClassById(id: string): Promise<IClass | null> {
        try {
            return await Class.findById(id).lean();
        } catch (error: any) {
            logger.error("Error finding Class: " + error.message);
            throw new ApiError(500, "Error finding Class: " + error.message);
        }
    }

    async findBySchoolId(schoolId: string): Promise<IClass[]> {
        try {
            return await Class.find({ schoolId }).lean();
        } catch (error: any) {
            logger.error("Error finding classes by school ID: " + error.message);
            throw new ApiError(500, "Error finding classes by school ID: " + error.message);
        }
    }

    async updateClass(id: string, data: Partial<IClass>): Promise<IClass | null> {
        try {
            return await Class.findByIdAndUpdate(id, data, { new: true }).lean();
        } catch (error: any) {
            logger.error("Error updating Class: " + error.message);
            throw new ApiError(500, "Error updating Class: " + error.message);
        }
    }

    async deleteClass(id: string) {
        try {
            return await Class.deleteOne({ _id: id });
        } catch (error: any) {
            logger.error("Error deleting Class: " + error.message);
            throw new ApiError(500, "Error deleting Class: " + error.message);
        }
    }

    async deleteClassBySchoolId(id: string) {
        try {
            return await Class.deleteMany({ schoolId: id });
        } catch (error: any) {
            logger.error("Error deleting Class by SchoolId: " + error.message);
            throw new ApiError(500, "Error deleting Class by SchoolId: " + error.message);
        }
    }
}

export class ClassServices {
    private classDb = new ClassDatabaseService();
    private studentServices = new StudentServices();

    async create(schoolId: string, classData: Partial<IClass>): Promise<HydratedDocument<IClass>> {
        if (!schoolId) {
            throw new ApiError(400, "SchoolId is missing");
        }

        if (!classData.className || !classData.section) {
            throw new ApiError(400, "ClassName and Section are required");
        }

        const newClass = await this.classDb.createClass({
            className: classData.className,
            section: classData.section,
            schoolId: new mongoose.Types.ObjectId(schoolId)
        });

        return newClass;
    }

    async getById(classId: string) {
        if (!classId) throw new ApiError(400, "Class ID is required");

        const classData = await this.classDb.findClassById(classId);
        if (!classData) throw new ApiError(404, "Class not found");

        return classData;
    }

    async getAll(schoolId: string) {
        if (!schoolId) throw new ApiError(400, "School ID is required");
        return await this.classDb.findBySchoolId(schoolId);
    }

    async update(classId: string, data: Partial<IClass>) {
        if (!classId) throw new ApiError(400, "Class ID is required");

        const updatedClass = await this.classDb.updateClass(classId, data);
        if (!updatedClass) throw new ApiError(404, "Class not found");

        return updatedClass;
    }

    async delete(classId: string) {
        if (!classId) throw new ApiError(400, "Class ID is required");

        // 1. Get Class to ensure it exists (optional but good for 404)
        const existingClass = await this.classDb.findClassById(classId);
        if (!existingClass) throw new ApiError(404, "Class not found");

        // 2. Delete the class
        await this.classDb.deleteClass(classId);

        // 3. Cascading delete: Delete students in this class
        // Logic moved to studentService to handle bulk delete by class ID. 
        // We don't need to fetch students first if we have a deleteByClassId method.
        await this.studentServices.deleteStudentByClass([classId]);

        return { message: "Class and associated students deleted successfully" };
    }

    async getClassesBySchool(schoolId: string) {
        return await this.classDb.findBySchoolId(schoolId);
    }

    async deleteBySchoolId(schoolId: string) {
        if (!schoolId) {
            throw new ApiError(400, "SchoolId is missing");
        }
        return await this.classDb.deleteClassBySchoolId(schoolId);
    }
}
