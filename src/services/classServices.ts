import { logger } from "../utils/logger";
import { Class } from "../model/classModel";
import { IClass } from "../types/cards.Types";
import mongoose, { HydratedDocument } from "mongoose";

export class ClassDatabaseService {
    async createClass(data: Partial<IClass>): Promise<HydratedDocument<IClass>> {
        try {
            return await Class.create(data);
        } catch (error: any) {
            logger.error("Error creating Class: " + error.message);
            throw new Error("Error creating Class: " + error.message);
        }

    }

    async findClassById(id: string): Promise<IClass | null> {
        try {
            return await Class.findById(id);
        } catch (error: any) {
            logger.error("Error finding Class: " + error.message);
            throw new Error("Error finding Class: " + error.message);
        }
    }
    async findBySchoolId(schoolId: string): Promise<{ _id: string }[]> {
        try {
            const classes = await Class.find(
                { schoolId },
                { _id: 1 }
            ).lean();

            return classes.map(cls => ({ _id: cls._id.toString() }));
        } catch (error: any) {
            logger.error("Error finding Class: " + error.message);
            throw new Error("Error finding Class: " + error.message);
        }
    }


    async findAllClass(): Promise<IClass[]> {
        try {
            return Class.find();
        } catch (error: any) {
            logger.error("Error updating Class: " + error.message);
            throw new Error("Error updating Class: " + error.message);
        }
    }
    async updateClass(id: string, data: Partial<IClass>): Promise<IClass | null> {
        try {
            return Class.findByIdAndUpdate(id, data, { new: true })
        } catch (error: any) {
            logger.error("Error updating Class: " + error.message);
            throw new Error("Error updating Class: " + error.message);
        }
    }
    async deleteClass(id: string) {
        try {
            return Class.deleteOne({ _id: id })
        } catch (error: any) {
            logger.error("Error deleting Class: " + error.message);
            throw new Error("Error deleting Class: " + error.message);
        }
    }
    async deleteClassBySchoolId(id: string) {
        try {
            return Class.deleteMany({ schoolId: id })
        } catch (error: any) {
            logger.error("Error deleting Class by SchoolId: " + error.message);
            throw new Error("Error deleting Class by SchoolId: " + error.message);
        }
    }

}

export class ClassServices {
    private classDb = new ClassDatabaseService()
    async create(schoolId: string, classData: Partial<IClass>): Promise<HydratedDocument<IClass>> {
        if (!schoolId) {
            throw new Error("SchoolId is missing")
        };

        if (!classData.className || !classData.section) {
            throw new Error("All fields are required");
        };

        const newClass = await this.classDb.createClass({
            className: classData.className,
            section: classData.section,
            schoolId: new mongoose.Types.ObjectId(schoolId)
        })

        return newClass
    }
    async getById(classId: string) {
        if (!classId) throw new Error("Class ID is required");
        return await this.classDb.findClassById(classId);
    }
    async getAll() {
        return await this.classDb.findAllClass();
    }

    async update(classId: string, data: Partial<IClass>) {
        if (!classId) throw new Error("Class ID is required");
        return await this.classDb.updateClass(classId, data);
    }
    async delete(classId: string) {
        if (!classId) throw new Error("Class ID is required");
        await this.classDb.deleteClass(classId);
        return { message: "Class deleted successfully" };
    }
    async getClassesBySchool(schoolId: string) {
        return await this.classDb.findBySchoolId(schoolId);
    }
    async deleteBySchoolId(schoolId: string) {
        if (!schoolId) {
            throw new Error("SchoolId is missing");
        }

        return await this.classDb.deleteClassBySchoolId(schoolId);
    }
}
