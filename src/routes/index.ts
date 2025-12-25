import { Router } from "express";
import userRouter from "./auth.Route"
import schoolRouter from "./school.Route"


const router = Router()

router.use('/user', userRouter);
router.use('/school', schoolRouter);

export default router;