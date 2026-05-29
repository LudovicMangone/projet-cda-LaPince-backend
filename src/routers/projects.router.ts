import { Router } from "express";
import { getOneProject } from "../controllers/projects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:id", authMiddleware, getOneProject);

export default router;
