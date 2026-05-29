import { Router } from "express";
import { getProjectByIdController } from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:id", authMiddleware, getProjectByIdController);

export default router;
