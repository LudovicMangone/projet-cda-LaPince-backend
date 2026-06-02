import { Router } from "express";
import {
	createProjectController,
	getProjectByIdController,
	getProjectsController,
	updateProjectByIdController,
} from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateProjectUpdate } from "../middlewares/project.middleware";

const router = Router();

router.get("/", authMiddleware, getProjectsController);
router.post("/", authMiddleware, createProjectController);
router.get("/:id", authMiddleware, getProjectByIdController);
router.patch(
	"/:id",
	authMiddleware,
	validateProjectUpdate,
	updateProjectByIdController,
);
export default router;
