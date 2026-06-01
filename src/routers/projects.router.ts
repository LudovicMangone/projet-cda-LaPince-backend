import { Router } from "express";
import { getProjectByIdController, getProjectsController } from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getProjectsController);
router.get("/:id", authMiddleware, getProjectByIdController);

export default router;
