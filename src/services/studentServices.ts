import { logger } from "../utils/logger";
import { Students } from "../model/studentModel";
import { IStudent } from "../types/cards.Types";
import { stringify } from "csv-stringify/sync";
import mongoose, { HydratedDocument } from "mongoose";
import { ApiError } from "../utils/ApiError";

export class StudentDatabaseService {
    async createStudent(data: Partial<IStudent>): Promise<HydratedDocument<IStudent>> {
        try {
            return await Students.create(data);
        } catch (error: any) {
            logger.error("Error creating student: " + error.message);
            throw new ApiError(500, "Error creating student: " + error.message);
        }
    }

    async findStudentById(id: string): Promise<HydratedDocument<IStudent> | null> {
        try {
            return await Students.findById(id);
        } catch (error: any) {
            logger.error("Error finding student: " + error.message);
            throw new ApiError(500, "Error finding student: " + error.message);
        }
    }

    async findAllStudents(): Promise<IStudent[]> {
        try {
            return await Students.find().lean();
        } catch (error: any) {
            logger.error("Error fetching students: " + error.message);
            throw new ApiError(500, "Error fetching students: " + error.message);
        }
    }

    async findStudentsByClass(classId: string): Promise<IStudent[]> {
        try {
            return await Students.find({ classId }).lean();
        } catch (error: any) {
            logger.error("Error fetching students by class: " + error.message);
            throw new ApiError(500, "Error fetching students by class: " + error.message);
        }
    }

    async updateStudent(id: string, data: Partial<IStudent>): Promise<HydratedDocument<IStudent> | null> {
        try {
            return await Students.findByIdAndUpdate(id, data, { new: true });
        } catch (error: any) {
            logger.error("Error updating student: " + error.message);
            throw new ApiError(500, "Error updating student: " + error.message);
        }
    }

    async deleteStudent(id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
        try {
            return await Students.deleteOne({ _id: id });
        } catch (error: any) {
            logger.error("Error deleting student: " + error.message);
            throw new ApiError(500, "Error deleting student: " + error.message);
        }
    }

    async deleteByClass(classIds: string[]): Promise<{ acknowledged: boolean; deletedCount: number }> {
        try {
            return await Students.deleteMany({
                classId: { $in: classIds },
            });
        } catch (error: any) {
            logger.error("Error deleting students by class: " + error.message);
            throw new ApiError(500, "Error deleting students by class: " + error.message);
        }
    }

    async insertMany(students: Partial<IStudent>[]): Promise<HydratedDocument<IStudent>[]> {
        try {
            return await Students.insertMany(students, { ordered: false });
        } catch (error: any) {
            logger.error("Error inserting students in bulk: " + error.message);
            // Don't throw 500 immediately if some succeed, but for now we expect clean data
            throw new ApiError(400, "Error inserting students in bulk: " + error.message);
        }
    }
}


export class StudentServices {
    private studentDb = new StudentDatabaseService();

    // Create Single Student
    async createStudent(classId: string, studentData: Partial<IStudent>): Promise<HydratedDocument<IStudent>> {

        if (!classId) throw new ApiError(400, "ClassId is required");

        const requiredFields = ["firstName", "lastName", "rollNumber", "age", "gender", "guardianName", "contactNumber"];
        for (const field of requiredFields) {
            if (!studentData[field as keyof IStudent]) {
                throw new ApiError(400, `${field} is required`);
            }
        }

        // Prevent Duplicate Roll Number
        const existing = await Students.findOne({ classId, rollNumber: studentData.rollNumber });
        if (existing) throw new ApiError(409, `Roll number ${studentData.rollNumber} already exists in this class.`);

        studentData.classId = new mongoose.Types.ObjectId(classId);

        return await this.studentDb.createStudent(studentData);
    }

    // Update Student
    async updateStudent(studentId: string, updateData: Partial<IStudent>) {
        if (!studentId) throw new ApiError(400, "Student ID is required");

        const updatedStudent = await this.studentDb.updateStudent(studentId, updateData);
        if (!updatedStudent) throw new ApiError(404, "Student not found");

        return updatedStudent;
    }

    // Get Student By ID
    async getStudentById(studentId: string) {
        if (!studentId) throw new ApiError(400, "Student ID is required");

        const student = await this.studentDb.findStudentById(studentId);
        if (!student) throw new ApiError(404, "Student not found");

        return student;
    }

    // Get All Students
    async getAllStudents() {
        return await this.studentDb.findAllStudents();
    }

    // Delete Student
    async deleteStudent(studentId: string) {
        if (!studentId) throw new ApiError(400, "StudentId is missing");
        return await this.studentDb.deleteStudent(studentId);
    }

    // Delete Student By Class
    async deleteStudentByClass(classId: string[]) {
        if (!classId || classId.length === 0) return; // No op if empty
        return await this.studentDb.deleteByClass(classId);
    }

    async bulkAddStudents(
        classId: string,
        studentsData: Partial<IStudent>[]
    ) {
        if (!classId) {
            throw new ApiError(400, "Class ID missing in import");
        }

        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            throw new ApiError(400, "Student data is empty");
        }

        // Normalize CSV rows → match schema
        const finalData = studentsData
            .filter(st =>
                st.firstName &&
                st.lastName &&
                st.rollNumber &&
                st.age &&
                st.gender &&
                st.contactNumber
            )
            .map(st => ({
                firstName: String(st.firstName).trim(),
                middleName: st.middleName ? String(st.middleName).trim() : undefined,
                lastName: String(st.lastName).trim(),

                rollNumber: String(st.rollNumber)
                    .trim()
                    .toUpperCase(),

                age: Number(st.age),

                gender: String(st.gender).trim() as "Male" | "Female" | "Other",

                guardianName: st.guardianName
                    ? String(st.guardianName).trim()
                    : undefined,

                contactNumber: String(st.contactNumber).trim(),

                avatar: st.avatar ? String(st.avatar).trim() : undefined,

                classId: new mongoose.Types.ObjectId(classId),
            }));

        if (finalData.length === 0) {
            throw new ApiError(400, "No valid student rows found in CSV");
        }

        // Invalid age check
        const invalidAge = finalData.find(st => !Number.isInteger(st.age));
        if (invalidAge) {
            throw new ApiError(400, "Age must be a valid integer in CSV file");
        }

        // Invalid gender check
        const allowedGenders = ["Male", "Female", "Other"];
        const invalidGender = finalData.find(
            st => !allowedGenders.includes(st.gender)
        );
        if (invalidGender) {
            throw new ApiError(400, "Invalid gender found. Allowed: Male, Female, Other");
        }

        // Duplicate rollNumber inside CSV
        const rollNumbers = finalData.map(st => st.rollNumber);
        const duplicates = rollNumbers.filter(
            (r, i) => rollNumbers.indexOf(r) !== i
        );

        if (duplicates.length > 0) {
            throw new ApiError(400, `Duplicate roll numbers found in CSV: ${[...new Set(duplicates)].join(", ")}`);
        }

        // Duplicate rollNumber in DB (Optimized query: Only check explicitly for this class + rollNumbers)
        // Original logic checked global rollNumbers? Roll numbers are usually unique per class, or per school. 
        // Assuming unique per Class based on `createStudent` logic. 
        // But the check below: `Students.find({ rollNumber: { $in: rollNumbers } })` checks globally if unique is per school/global.
        // `createStudent` checked: `Students.findOne({ classId, rollNumber: ... })`.
        // So uniqueness scope is (classId, rollNumber).
        // I should fix the bulk check to be scoped to ClassId as well!

        const existing = await Students.find({
            classId: classId,
            rollNumber: { $in: rollNumbers },
        }).select("rollNumber");

        if (existing.length > 0) {
            throw new ApiError(409, `Roll numbers already exist in this class: ${existing
                .map(s => s.rollNumber)
                .join(", ")}`);
        }

        // Insert safely
        return await this.studentDb.insertMany(finalData as any);
    }

    // Get All Students by Class ID
    async getStudentsByClass(classId: string) {
        return await this.studentDb.findStudentsByClass(classId);
    }

    // Export Excel File
    // Export CSV Method
    async exportStudentsToCSV(classId: string) {
        if (!classId) {
            throw new ApiError(400, "Class ID is required");
        }

        const students = await this.getStudentsByClass(classId);

        if (!students || students.length === 0) {
            throw new ApiError(404, "No students found for this class");
        }

        const records = students.map(st => ({
            "First Name": st.firstName,
            "Middle Name": st.middleName || "",
            "Last Name": st.lastName,
            "Roll Number": st.rollNumber,
            "Age": st.age,
            "Gender": st.gender,
            "Guardian Name": st.guardianName || "",
            "Contact Number": st.contactNumber
        }));

        const csv = stringify(records, {
            header: true
        });

        return Buffer.from(csv);
    }

    // Export Excel Method (Real .xlsx)
    async exportStudentsToExcel(classId: string) {
        if (!classId) {
            throw new ApiError(400, "Class ID is required");
        }

        const students = await this.getStudentsByClass(classId);

        if (!students || students.length === 0) {
            throw new ApiError(404, "No students found for this class");
        }

        const ExcelJS = require('exceljs'); // Importing here to avoid global type issues if not fully installed yet or keeping lazy
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Students');

        // Define columns
        sheet.columns = [
            { header: 'First Name', key: 'firstName', width: 15 },
            { header: 'Middle Name', key: 'middleName', width: 15 },
            { header: 'Last Name', key: 'lastName', width: 15 },
            { header: 'Roll Number', key: 'rollNumber', width: 15 },
            { header: 'Age', key: 'age', width: 5 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Guardian Name', key: 'guardianName', width: 20 },
            { header: 'Contact Number', key: 'contactNumber', width: 15 },
        ];

        // Add rows
        students.forEach(st => {
            sheet.addRow({
                firstName: st.firstName,
                middleName: st.middleName || "",
                lastName: st.lastName,
                rollNumber: st.rollNumber,
                age: st.age,
                gender: st.gender,
                guardianName: st.guardianName || "",
                contactNumber: st.contactNumber
            });
        });

        // Style the header row
        sheet.getRow(1).font = { bold: true };

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}
