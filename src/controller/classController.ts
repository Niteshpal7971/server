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
    // Import Students via Excel or CSV
    async importStudents(req: Request, res: Response) {
        try {
            const { classId } = req.params;

            if (!classId) {
                throw new ApiError(400, "ClassId is required");
            }

            if (!req.file) {
                throw new ApiError(400, "File is required");
            }

            let students: any[] = [];
            const mimeType = req.file.mimetype;

            // Handle Excel (.xlsx)
            if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                const ExcelJS = require('exceljs');
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(req.file.buffer);

                const worksheet = workbook.worksheets[0];
                if (!worksheet) {
                    throw new ApiError(400, "Excel file is empty or has no sheets");
                }

                const headers: string[] = [];
                worksheet.getRow(1).eachCell((cell: any, colNumber: number) => {
                    if (cell.value) headers[colNumber] = cell.value.toString();
                });

                worksheet.eachRow((row: any, rowNumber: number) => {
                    if (rowNumber === 1) return; // Skip header

                    const rowData: any = {};
                    row.eachCell((cell: any, colNumber: number) => {
                        const header = headers[colNumber];
                        if (header) {
                            // Map values to expected keys if header names differ? 
                            // Or assume headers match partial IStudent keys (firstName, lastName, etc.)
                            // For simplicity, let's assume valid headers or mapped in service. 
                            // But service expects student object keys. 
                            // Ideally we might want a simple mapper if user uses "First Name" vs "firstName".
                            // For enterprise system, relying on exact camelCase match is rigid.
                            // But current CSV import expected csv-parse result which uses headers as keys.
                            // So we should do the same here.

                            // Let's try to map typical headers to keys if possible, or just use header value as key.
                            // Let's stick to raw header value for now, assuming user downloads template or matches CSV format.
                            if (cell.value && typeof cell.value === 'object' && cell.value.text) {
                                rowData[header] = cell.value.text; // Hyperlinks etc
                            } else {
                                rowData[header] = cell.value;
                            }
                        }
                    });
                    if (Object.keys(rowData).length > 0) {
                        students.push(rowData);
                    }
                });

            } else {
                // Default to CSV
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
            }

            if (students.length === 0) {
                throw new ApiError(400, "File is empty or could not be parsed");
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
            const { format } = req.query;

            if (format === 'excel') {
                const excelBuffer = await this.studentService.exportStudentsToExcel(classId as string);

                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=students.xlsx"
                );
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.send(excelBuffer);
            } else {
                const csvBuffer = await this.studentService.exportStudentsToCSV(classId as string);

                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=students.csv"
                );
                res.setHeader(
                    "Content-Type",
                    "text/csv"
                );
                res.send(csvBuffer);
            }
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };
}