import { SchoolServices } from "../services/schoolServices";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const schoolService = new SchoolServices();

export class SchoolController {
  async createSchool(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized request");
      }
      const payload = {
        ...req.body,
        createdBy: userId
      };
      const school = await schoolService.create(payload);

      res.status(201).json(
        new ApiResponse(201, school, "School created successfully")
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

  async getAllSchools(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized request");
      }

      const schools = await schoolService.getAll(userId);

      res.status(200).json(
        new ApiResponse(200, schools, "Schools fetched successfully")
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }

  async getSchoolById(req: Request, res: Response) {
    try {
      const school = await schoolService.getById(req.params.id as string);

      res.status(200).json(
        new ApiResponse(200, school, "School fetched successfully")
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }

  async updateSchool(req: Request, res: Response) {
    try {
      const school = await schoolService.update(
        req.params.id as string,
        req.body
      );

      res.status(200).json(
        new ApiResponse(200, school, "School updated successfully")
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }

  async deleteSchool(req: Request, res: Response) {
    try {
      const result = await schoolService.delete(req.params.id as string);

      res.status(200).json(
        new ApiResponse(200, result, "School deleted successfully")
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }

  // Kept commented out as per original file, preserving potential future logic
  /*
  async getSchoolsWithClassCount(req: Request, res: Response): Promise<void> {
    try {
      // Implementation...
    } catch (error: any) {
      // Error handling...
    }
  }
  */
}
