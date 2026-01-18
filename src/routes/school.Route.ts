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
router.post("/create-school", authenticateToken, school.createSchool);
router.post("/getSchool/:id", authenticateToken, school.getSchoolById);
router.get("/get-schools", authenticateToken, school.getAllSchools);
router.put("/update-school/:id", authenticateToken, school.updateSchool);
router.delete("/delete-school/:id", authenticateToken, school.deleteSchool);

// class Route
router.post("/:schoolId/create-class", authenticateToken, classController.createClass.bind(classController));
router.get("/get-classes", authenticateToken, classController.getAllClasses.bind(classController));
router.get("/get-class/:classId", authenticateToken, classController.getClassById.bind(classController));
router.put("/update-class/:classId", authenticateToken, classController.updateClass.bind(classController));
router.delete("/delete-class/:classId", authenticateToken, classController.deleteClass.bind(classController));
router.post("/:classId/import", authenticateToken, upload.single("file"), classController.importStudents);
router.get("/:classId/export", authenticateToken, classController.exportStudents);


// Student Route

router.post('/:id/create-student', authenticateToken, upload.single('image'), validateFields(createStudentSchema), studentController.createStudent)
router.get("/students", authenticateToken, studentController.getAllStudents);
router.get("/students/:studentId", authenticateToken, studentController.getStudentById);
router.put("/students/:studentId", authenticateToken, validateFields(updateStudentSchema), studentController.updateStudent);
router.delete("/students/:studentId", authenticateToken, studentController.deleteStudent);

export default router;
