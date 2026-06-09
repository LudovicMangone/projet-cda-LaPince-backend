import { Router } from "express";
import {
	getAlertsController,
	updateAlertController,
} from "../controllers/alert.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getAlertsController);
router.patch("/:alerteId", authMiddleware, updateAlertController);

export default router;