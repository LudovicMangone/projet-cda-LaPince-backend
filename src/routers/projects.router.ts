import { Router } from "express";
import { getProjectBalanceController } from "../controllers/balance.controller";
import { getProjectBudgetsController } from "../controllers/budgets.controller";
import {
	createProjectController,
	getOperationsController,
	getProjectByIdController,
	getProjectsController,
} from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getProjectsController);
router.post("/", authMiddleware, createProjectController);
router.get("/:id/budgets", authMiddleware, getProjectBudgetsController);
router.get("/:id/balance", authMiddleware, getProjectBalanceController);
router.get("/:id", authMiddleware, getProjectByIdController);
router.get("/:id/operations", authMiddleware, getOperationsController);

export default router;
