import { ClassServices } from "../services/classServices";
import { Request, Response } from "express";
import { StudentServices } from "../services/studentServices";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export class ClassController {
    private classService = new ClassServices();
    private studentService = new StudentServices();

    async createClass(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new ApiError(401, "Unauthorized");

            const payload = {
                ...req.body,
                createdBy: userId
            };

            const newClass = await this.classService.create(req.params.schoolId as string, payload);

            res.status(201).json(
                new ApiResponse(201, newClass, "Class created successfully")
            );
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getClassById(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const classData = await this.classService.getById(classId as string);

            res.status(200).json(
                new ApiResponse(200, classData, "Class fetched successfully")
            );
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get All Classes
    async getAllClasses(req: Request, res: Response) {
        try {
            const classes = await this.classService.getAll(req.params.schoolId as string);

            res.status(200).json(
                new ApiResponse(200, classes, "Classes fetched successfully")
            );
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Update Class
    async updateClass(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const updatedClass = await this.classService.update(classId as string, req.body);

            res.status(200).json(
                new ApiResponse(200, updatedClass, "Class updated successfully")
            );
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Delete Class
    async deleteClass(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const result = await this.classService.delete(classId as string);

            res.status(200).json(
                new ApiResponse(200, result, "Class deleted successfully")
            );
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Import Students via Excel
    async importStudents(req: Request, res: Response) {
        try {
            const { classId } = req.params;

            if (!classId) {
                throw new ApiError(400, "ClassId is required");
            }

            if (!req.file) {
                throw new ApiError(400, "CSV file is required");
            }

            const students: any[] = [];

            await new Promise<void>((resolve, reject) => {
                Readable.from(req.file!.buffer)
                    .pipe(
                        parse({
                            columns: true,          // first row = headers
                            skip_empty_lines: true,
                            trim: true,
                            relax_quotes: true,
                            relax_column_count: true,
                        })
                    )
                    .on("data", (row) => {
                        students.push(row);
                    })
                    .on("end", () => resolve())
                    .on("error", (err) => reject(err));
            });

            if (students.length === 0) {
                throw new ApiError(400, "CSV file is empty");
            }

            const result = await this.studentService.bulkAddStudents(classId, students);

            res.status(201).json(
                new ApiResponse(201, result, "Students imported successfully")
            );

        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error",
                errors: error.errors || []
            });
        }
    }

    // Export Students to Excel
    exportStudents = async (req: Request, res: Response) => {
        try {
            const { classId } = req.params;

            const excelBuffer = await this.studentService.exportStudentsToExcel(classId as string);

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=students.csv"
            );
            res.setHeader(
                "Content-Type",
                "text/csv"
            );

            res.send(excelBuffer);
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };
}