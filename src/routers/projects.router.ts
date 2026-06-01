import { Router } from "express";
import {
	getProjectByIdController,
	updateProjectByIdController,
} from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.patch("/:id", authMiddleware, updateProjectByIdController);
router.get("/:id", authMiddleware, getProjectByIdController);

export default router;
