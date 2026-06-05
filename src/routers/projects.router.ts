import { Router } from "express";
import { getProjectBalanceController } from "../controllers/balance.controller";
import { getProjectBudgetsController } from "../controllers/budgets.controller";
import {
	createOperationsController,
	createProjectController,
	deleteProjectByIdController,
	getOperationsController,
	getProjectByIdController,
	getProjectsController,
	updateProjectByIdController,
	updateProjectParticipantsController,
} from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	validateProjectParticipantsUpdate,
	validateProjectUpdate,
} from "../middlewares/project.middleware";

const router = Router();

router.get("/", authMiddleware, getProjectsController);
router.post("/", authMiddleware, createProjectController);
router.get("/:id/budgets", authMiddleware, getProjectBudgetsController);
router.get("/:id/balance", authMiddleware, getProjectBalanceController);
router.get("/:id/operations", authMiddleware, getOperationsController);
router.post("/:id/operations", authMiddleware, createOperationsController);
router.get("/:id", authMiddleware, getProjectByIdController);
router.patch(
	"/:id/participants",
	authMiddleware,
	validateProjectParticipantsUpdate,
	updateProjectParticipantsController,
);
router.get("/:id", authMiddleware, getProjectByIdController);
router.patch(
	"/:id",
	authMiddleware,
	validateProjectUpdate,
	updateProjectByIdController,
);
router.delete("/:id", authMiddleware, deleteProjectByIdController);

export default router;
