import { Router } from "express";
import {
	createProjectController,
	getProjectByIdController,
	getProjectsController,
} from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getProjectsController);
router.post("/", authMiddleware, createProjectController);
router.get("/:id", authMiddleware, getProjectByIdController);

export default router;
