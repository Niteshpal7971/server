import { SchoolServices } from "../services/schoolServices";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const schoolService = new SchoolServices();

export class SchoolController {
  async createSchool(req: Request, res: Response) {
    try {
      const school = await schoolService.create(req.body);
      res.status(201).json({ message: "School created", school });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllSchools(req: Request, res: Response) {
    try {
      const schools = await schoolService.getAll();
      res.json(schools);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSchoolById(req: Request, res: Response) {
    try {
      const school = await schoolService.getById(req.params.id as string);
      if (!school) return res.status(404).json({ error: "School not found" });
      res.json(school);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSchool(req: Request, res: Response) {
    try {
      console.log(req.body, req.params.id, "req");
      const school = await schoolService.update(
        req.params.id as string,
        req.body
      );
      if (!school) return res.status(404).json({ error: "School not found" });
      res.json(school);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteSchool(req: Request, res: Response) {
    try {
      const school = await schoolService.delete(req.params.id as string);
      if (!school) return res.status(404).json({ error: "School not found" });
      res.json({ message: "School deleted successfully", school });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get schools with class count
   * GET /api/schools/with-class-count
   */
//   async getSchoolsWithClassCount(req: Request, res: Response): Promise<void> {
//     try {
//       const { page = 1, limit = 10, createdBy } = req.query;
//       const skip = ((page as number) - 1) * (limit as number);

//       const matchStage: any = {};
//       if (createdBy) {
//         matchStage.createdBy = new mongoose.Types.ObjectId(createdBy as string);
//       }

//       const pipeline = [
//         { $match: matchStage },
//         {
//           $lookup: {
//             from: "classes",
//             localField: "_id",
//             foreignField: "schoolId",
//             as: "classes",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "createdBy",
//             foreignField: "_id",
//             as: "creator",
//             pipeline: [{ $project: { name: 1, email: 1 } }],
//           },
//         },
//         {
//           $addFields: {
//             classCount: { $size: "$classes" },
//             createdBy: { $arrayElemAt: ["$creator", 0] },
//           },
//         },
//         {
//           $project: {
//             schoolName: 1,
//             address: 1,
//             createdBy: 1,
//             classCount: 1,
//             createdAt: 1,
//             updatedAt: 1,
//           },
//         },
//         { $sort: { createdAt: -1 } },
//         { $skip: skip },
//         { $limit: limit as number },
//       ];

//       const [schools, totalCount] = await Promise.all([
//         School.aggregate(pipeline),
//         School.countDocuments(matchStage),
//       ]);

//       const totalPages = Math.ceil(totalCount / (limit as number));

//       res.json({
//         success: true,
//         data: schools,
//         pagination: {
//           currentPage: page as number,
//           totalPages,
//           totalSchools: totalCount,
//           hasNext: (page as number) < totalPages,
//           hasPrev: (page as number) > 1,
//         },
//       });
//     } catch (error: any) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch schools with class count",
//         error: error.message,
//       });
//     }
//   }
}
