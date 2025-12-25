import { StudentServices } from "../services/studentServicces";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

const studentService = new StudentServices();
export class StudentController {
    async createStudent(req: Request, res: Response) {
        try {
            const classId: any = req.params.id
            const school = await studentService.createStudent(classId, req.body);
            res.status(201).json({ message: "School created", school });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
    // Update student: PUT /students/:studentId
    updateStudent = async (req: Request, res: Response) => {
        try {
            const { studentId } = req.params;
            const payload = req.body;

            const updated = await studentService.updateStudent(studentId as string, payload);
            return res.status(200).json({ success: true, message: "Student updated", data: updated });
        } catch (err: any) {
            logger?.error?.("updateStudent error: " + err.message);
            return res.status(400).json({ success: false, message: err.message });
        }
    };

    // Get single student: GET /students/:studentId
    getStudentById = async (req: Request, res: Response) => {
        try {
            const { studentId } = req.params;
            const student = await studentService.getStudentById(studentId as string);
            return res.status(200).json({ success: true, data: student });
        } catch (err: any) {
            logger?.error?.("getStudentById error: " + err.message);
            return res.status(404).json({ success: false, message: err.message });
        }
    };

    // Get all students: GET /students
    getAllStudents = async (req: Request, res: Response) => {
        try {
            const students = await studentService.getAllStudents();
            return res.status(200).json({ success: true, data: students });
        } catch (err: any) {
            logger?.error?.("getAllStudents error: " + err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
    };

    // Get students by class: GET /class/:classId/students
    getStudentsByClass = async (req: Request, res: Response) => {
        try {
            const { classId } = req.params;
            const students = await studentService.getStudentsByClass(classId as string);
            return res.status(200).json({ success: true, data: students });
        } catch (err: any) {
            logger?.error?.("getStudentsByClass error: " + err.message);
            return res.status(400).json({ success: false, message: err.message });
        }
    };

    // Delete student: DELETE /students/:studentId
    deleteStudent = async (req: Request, res: Response) => {
        try {
            const { studentId } = req.params;
            await studentService.deleteStudent(studentId as string);
            return res.status(200).json({ success: true, message: "Student deleted" });
        } catch (err: any) {
            logger?.error?.("deleteStudent error: " + err.message);
            return res.status(400).json({ success: false, message: err.message });
        }
    };
}