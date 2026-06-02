import { Router } from "express";
import {
	getProjectByIdController,
	updateProjectByIdController,
} from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateProjectUpdate } from "../middlewares/project.middleware";

const router = Router();

router.patch(
	"/:id",
	authMiddleware,
	validateProjectUpdate,
	updateProjectByIdController,
);
router.get("/:id", authMiddleware, getProjectByIdController);

export default router;
