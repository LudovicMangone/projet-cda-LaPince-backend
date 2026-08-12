import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// Pas de authMiddleware sur /refresh : c'est justement la route qu'on appelle
// quand l'access token est expiré — elle s'authentifie par le cookie de session
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
