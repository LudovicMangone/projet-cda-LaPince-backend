import type { Request, Response } from "express";
import { getProjectById } from "../services/projects.service";

export async function getOneProject(req: Request, res: Response) {
	const project = await getProjectById(Number(req.params.id));
	res.status(200).json({ project });
}
