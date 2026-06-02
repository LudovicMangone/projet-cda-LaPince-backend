import { Router } from "express";
import { getOperationsController, getProjectByIdController } from "../controllers/projects.controller";
import { createProjectController, getProjectsController } from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getProjectsController);
router.post("/", authMiddleware, createProjectController);
router.get("/:id", authMiddleware, getProjectByIdController);
router.get("/:id/operations", authMiddleware, getOperationsController);

export default router;
