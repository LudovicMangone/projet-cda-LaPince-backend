import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";
import { UnauthorizedError } from "../lib/errors";

export function authMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		throw new UnauthorizedError("Token manquant ou invalide");
	}

	const token = authHeader.split(" ")[1];
	const secret = envConfig.jwtSecret;

	try {
		const payload = jwt.verify(token, secret) as { userId: number };
		req.userId = payload.userId;
		next();
	} catch {
		throw new UnauthorizedError("Token expiré ou invalide");
	}
}
