
import type { Request, Response } from "express";

export async function register(_req: Request, _res: Response) {
  console.log("register called");
}

export async function login(_req: Request, _res: Response) {  
  console.log("login called");
}

export async function logout(_req: Request, res: Response) {
  res.status(200).json({ message: "Déconnexion réussie" });
}

export async function me(_req: Request, _res: Response) {
  console.log("me called");
}