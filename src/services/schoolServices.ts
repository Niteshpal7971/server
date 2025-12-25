import { logger } from "../utils/logger";
import { School } from "../model/school.Model";
import { ISchool } from "../types/cards.Types";
import { HydratedDocument } from "mongoose";
import { ClassServices } from "./classServices";
import { StudentServices } from "./studentServicces";

export class SchoolDatabaseService {



    async createSchool(data: Partial<ISchool>): Promise<HydratedDocument<ISchool>> {
        try {
            return await School.create(data);
        } catch (error: any) {
            logger.error("Error creating school: " + error.message);
            throw new Error("Error creating school: " + error.message);
        }

    }

    async getSchoolById(id: string): Promise<HydratedDocument<ISchool> | null> {
        try {
            return await School.findById(id);
        } catch (error: any) {
            logger.error("Error finding school: " + error.message);
            throw new Error("Error finding school: " + error.message);
        }
    }

    async getAllSchool(): Promise<HydratedDocument<ISchool>[]> {
        try {
            return School.find();
        } catch (error: any) {
            logger.error("Error updating school: " + error.message);
            throw new Error("Error updating school: " + error.message);
        }
    }
    async updateSchool(id: string, data: Partial<ISchool>): Promise<HydratedDocument<ISchool> | null> {
        try {
            return School.findByIdAndUpdate(id, data, { new: true })
        } catch (error: any) {
            logger.error("Error updating school: " + error.message);
            throw new Error("Error updating school: " + error.message);
        }
    }
    async deleteSchool(id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
        try {
            return School.deleteOne({ _id: id })
        } catch (error: any) {
            logger.error("Error deleting school: " + error.message);
            throw new Error("Error deleting school: " + error.message);
        }
    }

}

export class SchoolServices {
    private schoolDb = new SchoolDatabaseService()
    private classServices = new ClassServices()
    private studentServices = new StudentServices()
    async create(schoolData: Partial<ISchool>): Promise<HydratedDocument<ISchool>> {
        const { schoolName, address, createdBy } = schoolData;

        if (!schoolName || !address || !createdBy) {
            throw new Error("All fields are required");
        }

        const newSchool = await this.schoolDb.createSchool({
            schoolName,
            address,
            createdBy
        })

        return newSchool;
    }
    async getAll() {
        const schools = await this.schoolDb.getAllSchool();
        for (const school of schools) {
            await school
                .populate("classes")
        }

        return schools;
    }

    async getById(id: string) {
        if (!id) {
            throw new Error("School Id is missing");
        };

        const school = await this.schoolDb.getSchoolById(id);
        if (!school) return null;

        // Populate classes
        await school.populate("classes");

        return school;
    }
    async update(schoolId: string, schoolData: Partial<ISchool>): Promise<HydratedDocument<ISchool> | null> {
        if (!schoolId) {
            throw new Error("School Id is missing");
        }
        if (!schoolData || Object.keys(schoolData).length === 0) {
            throw new Error("updated data is required");
        }

        if (schoolData.schoolName) schoolData.schoolName = schoolData.schoolName.trim();
        if (schoolData.address) schoolData.address = schoolData.address.trim();

        return await this.schoolDb.updateSchool(schoolId, schoolData)
    }

    async delete(id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
        if (!id) {
            throw new Error("Id for requested school is missing")
        };
        const deletedSchool = await this.schoolDb.deleteSchool(id);

        // 2) Get all classes of this school
        const classes = await this.classServices.getClassesBySchool(id);
        const classIds = classes.map(c => c._id.toString());

        // 3) Delete all classes
        await this.classServices.deleteBySchoolId(id);

        // 4) Delete all students of these classIds
        await this.studentServices.deleteStudentByClass(classIds);

        return deletedSchool;
    }
}