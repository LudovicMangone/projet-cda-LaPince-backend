import argon2 from "argon2";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { loginSchema, registerSchema } from "../schema/auth.schema";

export async function register(req: Request, res: Response) {
	const { name, email, password } = await registerSchema.parseAsync(req.body);

	const existingUser = await prisma.appUser.findUnique({ where: { email } });
	if (existingUser) {
		throw new ConflictError("Cet email est déjà utilisé");
	}

	const hashedPassword = await argon2.hash(password);

	const user = await prisma.appUser.create({
		data: { name, email, password: hashedPassword },
		select: { id: true, name: true, email: true },
	});

	res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = await loginSchema.parseAsync(req.body);

  const user = await prisma.appUser.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError("Email ou mot de passe incorrect");

  const isValid = await argon2.verify(user.password, password);
  if (!isValid) throw new UnauthorizedError("Email ou mot de passe incorrect");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
}

export async function logout(_req: Request, res: Response) {
	res.status(200).json({ message: "Déconnexion réussie" });
}

export async function me(req: Request, res: Response) {
	const user = await prisma.appUser.findUnique({
		where: { id: req.userId },
		select: { id: true, name: true, email: true },
	});

	if (!user) {
		throw new UnauthorizedError("Utilisateur introuvable");
	}

	res.status(200).json({ user });
}
