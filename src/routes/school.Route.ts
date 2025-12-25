import { Router } from "express";
import { SchoolController } from "../controller/schoolController";
import { ClassController } from "../controller/classController";
import { StudentController } from "../controller/studentsController";
import { validateFields } from "../middleware/validation.Middleware";
import { createStudentSchema, updateStudentSchema } from "../validations/student.validation"
import { upload } from "../middleware/uploadMiddleware";

const router = Router();
const school = new SchoolController();
const classController = new ClassController();
const studentController = new StudentController();

// school route
router.post("/create-school", school.createSchool);
router.post("/getSchool/:id", school.getSchoolById);
router.get("/get-schools", school.getAllSchools);
router.put("/update-school/:id", school.updateSchool);
router.delete("/delete-school/:id", school.deleteSchool);

// class Route
router.post("/:schoolId/create-class", classController.createClass.bind(classController));
router.get("/get-classes", classController.getAllClasses.bind(classController));
router.get("/get-class/:classId", classController.getClassById.bind(classController));
router.put("/update-class/:classId", classController.updateClass.bind(classController));
router.delete("/delete-class/:classId", classController.deleteClass.bind(classController));
router.post("/:classId/import", upload.single("file"), classController.importStudents);
router.get("/:classId/export", classController.exportStudents);


// Student Route

router.post('/:id/create-student', validateFields(createStudentSchema), studentController.createStudent)
router.get("/students", studentController.getAllStudents);
router.get("/students/:studentId", studentController.getStudentById);
router.put("/students/:studentId", validateFields(updateStudentSchema), studentController.updateStudent);
router.delete("/students/:studentId", studentController.deleteStudent);

export default router;
