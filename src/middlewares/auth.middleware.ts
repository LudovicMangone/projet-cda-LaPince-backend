import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../lib/errors";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token manquant ou invalide");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: number };

    req.userId = payload.userId;
    next();
  } catch {
    throw new UnauthorizedError("Token expiré ou invalide");
  }
}