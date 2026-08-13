import { Router } from "express";
import { getUserGlobalBalanceController } from "../controllers/balance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", authMiddleware, getUserGlobalBalanceController);

export default router;
