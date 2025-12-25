import { ClassServices } from "../services/classServices";
import { Request, Response, NextFunction } from "express";
import { StudentServices } from "../services/studentServicces";
import * as XLSX from "xlsx";
// import { logger } from "../utils/logger";

export class ClassController {
    private classService = new ClassServices();
    private studentService = new StudentServices();
    async createClass(req: Request, res: Response) {
        try {
            const newClass = await this.classService.create(req.params.schoolId as string, req.body);
            res.status(201).json({ message: "class created", newClass });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getClassById(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const classData = await this.classService.getById(classId as string);

            if (!classData) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }

            return res.status(200).json({ success: true, data: classData });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // Get All Classes
    async getAllClasses(req: Request, res: Response) {
        try {
            const classes = await this.classService.getAll();
            return res.status(200).json({ success: true, data: classes });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // Update Class
    async updateClass(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const updateData = req.body;

            const updatedClass = await this.classService.update(classId as string, updateData);

            if (!updatedClass) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Class updated successfully",
                data: updatedClass,
            });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // Delete Class
    async deleteClass(req: Request, res: Response) {
        try {
            const { classId } = req.params;

            await this.classService.delete(classId as string);

            return res.status(200).json({
                success: true,
                message: "Class deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ✅ FIXED: Import Students via Excel
    async importStudents(req: Request, res: Response) {
        try {
            const { classId } = req.params;

            if (!req.file) {
                return res.status(400).json({ message: "File is required" });
            }

            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                return res.status(400).json({ message: "Invalid Excel file" });
            }

            // ✅ Fix: Explicitly assert sheetName as string
            const sheetName = workbook.SheetNames[0] as string;

            // ✅ Fix: Also assert worksheet exists
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                return res.status(400).json({ message: "Worksheet not found in the uploaded file" });
            }

            const rows = XLSX.utils.sheet_to_json(sheet);

            await this.studentService.bulkAddStudents(classId as string, rows as any[]);

            return res.status(201).json({ message: "Students imported successfully" });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // ✅ Export Students to Excel
    exportStudents = async (req: Request, res: Response) => {
        try {
            const { classId } = req.params;
            const excelBuffer = await this.studentService.exportStudentsToExcel(classId as string);

            res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            res.send(excelBuffer);
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}