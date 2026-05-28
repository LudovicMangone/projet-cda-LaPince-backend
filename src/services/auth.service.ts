import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.appUser.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Cet email est déjà utilisé");
  }

  const hashedPassword = await argon2.hash(data.password);

  const user = await prisma.appUser.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true },
  });

  return user;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.appUser.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const isValid = await argon2.verify(user.password, data.password);
  if (!isValid) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

export async function getMe(userId: number) {
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new UnauthorizedError("Utilisateur introuvable");
  }

  return user;
}