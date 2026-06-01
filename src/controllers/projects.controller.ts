import type { Request, Response } from "express";
import { getProjectById } from "../services/projects.service";

export async function getProjectByIdController(req: Request, res: Response) {
	const project = await getProjectById(
		Number(req.params.id),
		Number(req.userId),
	);

	return res.status(200).json({ project });
}

export async function updateProjectByIdController(
	req: Request,
	res: Response,
) {}
