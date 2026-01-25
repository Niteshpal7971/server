import { logger } from "../utils/logger";
import { School } from "../model/school.Model";
import { ISchool } from "../types/cards.Types";
import { HydratedDocument } from "mongoose";
import { ClassServices } from "./classServices";
import { StudentServices } from "./studentServices";
import { ApiError } from "../utils/ApiError";

export class SchoolDatabaseService {

    async createSchool(data: Partial<ISchool>): Promise<HydratedDocument<ISchool>> {
        try {
            return await School.create(data);
        } catch (error: any) {
            logger.error("Error creating school: " + error.message);
            throw new ApiError(500, "Error creating school: " + error.message);
        }
    }

    async getSchoolById(id: string): Promise<HydratedDocument<ISchool> | null> {
        try {
            return await School.findById(id).populate("classes");
        } catch (error: any) {
            logger.error("Error finding school: " + error.message);
            throw new ApiError(500, "Error finding school: " + error.message);
        }
    }

    async getAllSchools(createdBy: string): Promise<HydratedDocument<ISchool>[]> {
        try {
            // Optimized: Populate in query to avoid N+1 problem
            return await School.find({ createdBy }).populate("classes");
        } catch (error: any) {
            logger.error("Error fetching schools: " + error.message);
            throw new ApiError(500, "Error fetching schools: " + error.message);
        }
    }

    async updateSchool(id: string, data: Partial<ISchool>): Promise<HydratedDocument<ISchool> | null> {
        try {
            return await School.findByIdAndUpdate(id, data, { new: true });
        } catch (error: any) {
            logger.error("Error updating school: " + error.message);
            throw new ApiError(500, "Error updating school: " + error.message);
        }
    }

    async deleteSchool(id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
        try {
            return await School.deleteOne({ _id: id });
        } catch (error: any) {
            logger.error("Error deleting school: " + error.message);
            throw new ApiError(500, "Error deleting school: " + error.message);
        }
    }
}

export class SchoolServices {
    private schoolDb = new SchoolDatabaseService();
    private classServices = new ClassServices();
    private studentServices = new StudentServices();

    async create(schoolData: Partial<ISchool>): Promise<HydratedDocument<ISchool>> {
        const { schoolName, address, createdBy } = schoolData;

        if (!schoolName || !address || !createdBy) {
            throw new ApiError(400, "All fields are required");
        }

        return await this.schoolDb.createSchool({
            schoolName,
            address,
            createdBy
        });
    }

    async getAll(createdBy: string) {
        if (!createdBy) {
            throw new ApiError(400, "User ID is required to fetch schools");
        }
        return await this.schoolDb.getAllSchools(createdBy);
    }

    async getById(id: string) {
        if (!id) {
            throw new ApiError(400, "School Id is missing");
        }

        const school = await this.schoolDb.getSchoolById(id);
        if (!school) throw new ApiError(404, "School not found");

        return school;
    }

    async update(schoolId: string, schoolData: Partial<ISchool>): Promise<HydratedDocument<ISchool> | null> {
        if (!schoolId) {
            throw new ApiError(400, "School Id is missing");
        }
        if (!schoolData || Object.keys(schoolData).length === 0) {
            throw new ApiError(400, "Updated data is required");
        }

        if (schoolData.schoolName) schoolData.schoolName = schoolData.schoolName.trim();
        if (schoolData.address) schoolData.address = schoolData.address.trim();

        const updatedSchool = await this.schoolDb.updateSchool(schoolId, schoolData);
        if (!updatedSchool) {
            throw new ApiError(404, "School not found");
        }
        return updatedSchool;
    }

    async delete(id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
        if (!id) {
            throw new ApiError(400, "Id for requested school is missing");
        }

        const schoolPlugin = await this.schoolDb.getSchoolById(id);
        if (!schoolPlugin) {
            throw new ApiError(404, "School not found");
        }

        // 1) Delete the school
        const deletedSchool = await this.schoolDb.deleteSchool(id);

        // 2) Get all classes of this school to perform cascading delete
        const classes = await this.classServices.getClassesBySchool(id);

        if (classes && classes.length > 0) {
            const classIds = classes.map(c => (c as any)._id.toString());

            // 3) Delete all classes
            await this.classServices.deleteBySchoolId(id);

            // 4) Delete all students of these classIds
            if (classIds.length > 0) {
                await this.studentServices.deleteStudentByClass(classIds);
            }
        }

        return deletedSchool;
    }
}