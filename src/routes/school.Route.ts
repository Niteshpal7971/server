import { Router } from "express";
import { SchoolController } from "../controller/schoolController";
import { ClassController } from "../controller/classController";
import { StudentController } from "../controller/studentsController";
import { validateFields } from "../middleware/validation.Middleware";
import { createStudentSchema, updateStudentSchema } from "../validations/student.validation"
import { upload } from "../middleware/uploadMiddleware";
import { authenticateToken } from "../middleware/authMiddleware"

const router = Router();
const school = new SchoolController();
const classController = new ClassController();
const studentController = new StudentController();

// school route
router.post("/createSchool", authenticateToken, school.createSchool);
router.post("/getSchool/:id", authenticateToken, school.getSchoolById);
router.get("/getSchools", authenticateToken, school.getAllSchools);
router.put("/:id/updateSchool", authenticateToken, school.updateSchool);
router.delete("/:id/deleteSchool", authenticateToken, school.deleteSchool);

// class Route
router.post("/:schoolId/createClass", authenticateToken, classController.createClass.bind(classController));
router.get("/:schoolId/getClasses", authenticateToken, classController.getAllClasses.bind(classController));
router.get("/getClass/:classId", authenticateToken, classController.getClassById.bind(classController));
router.patch("/:classId/updateClass", authenticateToken, classController.updateClass.bind(classController));
router.delete("/:classId/deleteClass", authenticateToken, classController.deleteClass.bind(classController));
router.post("/:classId/import", authenticateToken, upload.single("file"), classController.importStudents.bind(classController));
router.get("/:classId/export", authenticateToken, classController.exportStudents.bind(classController));


// Student Route

router.post('/:id/createStudent', authenticateToken, upload.single('image'), validateFields(createStudentSchema), studentController.createStudent)
router.get("/:classId/students", authenticateToken, studentController.getStudentsByClass);
router.get("/students/:studentId", authenticateToken, studentController.getStudentById);
router.patch("/students/:studentId", authenticateToken, upload.single('image'), validateFields(updateStudentSchema), studentController.updateStudent);
router.delete("/students/:studentId", authenticateToken, studentController.deleteStudent);

export default router;
