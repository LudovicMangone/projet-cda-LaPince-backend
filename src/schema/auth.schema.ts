import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});