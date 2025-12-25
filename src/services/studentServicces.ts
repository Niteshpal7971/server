import { logger } from "../utils/logger";
import { Students } from "../model/studentModel";
import { IStudent } from "../types/cards.Types";
import XLSX from "xlsx";
import mongoose, { HydratedDocument } from "mongoose";

export class StudentDatabaseServices {
    async createStudents(data: Partial<IStudent>): Promise<HydratedDocument<IStudent>> {
        try {
            return await Students.create(data);
        } catch (error: any) {
            logger.error("Error creating student: " + error.message);
            throw new Error("Error creating student: " + error.message);
        }
    }

    async findStudentsById(id: string): Promise<HydratedDocument<IStudent> | null> {
        try {
            return await Students.findById(id);
        } catch (error: any) {
            logger.error("Error finding student: " + error.message);
            throw new Error("Error finding student: " + error.message);
        }
    }

    async findAllStudents(): Promise<HydratedDocument<IStudent>[]> {
        try {
            return await Students.find();
        } catch (error: any) {
            logger.error("Error fetching students: " + error.message);
            throw new Error("Error fetching students: " + error.message);
        }
    }

    async updateStudents(id: string, data: Partial<IStudent>): Promise<HydratedDocument<IStudent> | null> {
        try {
            return await Students.findByIdAndUpdate(id, data, { new: true });
        } catch (error: any) {
            logger.error("Error updating student: " + error.message);
            throw new Error("Error updating student: " + error.message);
        }
    }

    async deleteStudents(id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
        try {
            return await Students.deleteOne({ _id: id });
        } catch (error: any) {
            logger.error("Error deleting student: " + error.message);
            throw new Error("Error deleting student: " + error.message);
        }
    }
    async deleteByClass(classIds: string[]): Promise<{ acknowledged: boolean; deletedCount: number }> {
        try {
            return await Students.deleteMany({
                classId: { $in: classIds },
            });
        } catch (error: any) {
            logger.error("Error deleting student: " + error.message);
            throw new Error("Error deleting student: " + error.message);
        }
    }
}


export class StudentServices {
    private studentDb = new StudentDatabaseServices();

    // ✅ Create Single Student
    async createStudent(classId: string, studentData: Partial<IStudent>): Promise<HydratedDocument<IStudent>> {

        if (!classId) throw new Error("ClassId is required");

        const requiredFields = ["firstName", "lastName", "rollNumber", "age", "gender", "guardianName", "contactNumber"];
        for (const field of requiredFields) {
            if (!studentData[field as keyof IStudent]) {
                throw new Error(`${field} is required`);
            }
        }

        // ✅ Prevent Duplicate Roll Number (Important)
        const existing = await Students.findOne({ classId, rollNumber: studentData.rollNumber });
        if (existing) throw new Error(`Roll number ${studentData.rollNumber} already exists in this class.`);

        studentData.classId = new mongoose.Types.ObjectId(classId);

        return await this.studentDb.createStudents(studentData);
    }

    // ✅ Update Student
    async updateStudent(studentId: string, updateData: Partial<IStudent>) {
        if (!studentId) throw new Error("Student ID is required");

        const updatedStudent = await this.studentDb.updateStudents(studentId, updateData);
        if (!updatedStudent) throw new Error("Student not found");

        return updatedStudent;
    }

    // ✅ Get Student By ID
    async getStudentById(studentId: string) {
        if (!studentId) throw new Error("Student ID is required");

        const student = await this.studentDb.findStudentsById(studentId);
        if (!student) throw new Error("Student not found");

        return student;
    }

    // ✅ Get All Students
    async getAllStudents() {
        return await this.studentDb.findAllStudents();
    }

    // ✅ Delete Student
    async deleteStudent(studentId: string) {
        if (!studentId) throw new Error("StudentId is missing");
        return await this.studentDb.deleteStudents(studentId);
    }
    // ✅ Delete Student By Class
    async deleteStudentByClass(classId: string[]) {
        if (classId.length === 0) throw new Error("StudentId is missing");
        return await this.studentDb.deleteByClass(classId);
    }

    // ✅ Bulk Add Students (Excel Import)
    async bulkAddStudents(classId: string, studentsData: Partial<IStudent>[]) {

        if (!classId) throw new Error("Class ID missing in import");

        // Map classId and remove blank rows
        const finalData = studentsData
            .filter(st => st.firstName && st.rollNumber) // remove garbage rows
            .map(st => ({
                ...st,
                classId: new mongoose.Types.ObjectId(classId)
            }));

        // Avoid duplicate roll numbers inside import
        const rollNumbers = finalData.map(st => st.rollNumber);
        const duplicates = rollNumbers.filter((r, i) => rollNumbers.indexOf(r) !== i);
        if (duplicates.length > 0) {
            throw new Error(`Duplicate roll numbers found in uploaded sheet: ${duplicates.join(", ")}`);
        }

        return await Students.insertMany(finalData);
    }

    // ✅ Get All Students by Class ID
    async getStudentsByClass(classId: string) {
        return await Students.find({ classId }).lean();
    }

    // ✅ Export Excel File
    async exportStudentsToExcel(classId: string) {
        const students = await this.getStudentsByClass(classId);

        const formatted = students.map(st => ({
            firstName: st.firstName,
            middleName: st.middleName,
            lastName: st.lastName,
            rollNumber: st.rollNumber,
            age: st.age,
            gender: st.gender,
            guardianName: st.guardianName,
            contactNumber: st.contactNumber
        }));

        const worksheet = XLSX.utils.json_to_sheet(formatted);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

        return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    }
}
