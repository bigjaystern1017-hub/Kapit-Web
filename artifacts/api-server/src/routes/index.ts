import { Router, type IRouter } from "express";
import healthRouter from "./health";
import kapitRouter from "./kapit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(kapitRouter);

export default router;
