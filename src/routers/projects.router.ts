import { Router } from "express";
import {
	createProjectController,
	deleteProjectByIdController,
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
router.delete("/:id", authMiddleware, deleteProjectByIdController);
export default router;
