import type { Request, Response } from "express";
import { createProjectSchema } from "../schemas/projects.schema";
import {
	createOperation,
	getOperationsByUserId,
} from "../services/operations.service";
import {
	createProject,
	deleteProjectById,
	getProjectById,
	getProjectsDashboard,
	updateProjectById,
} from "../services/projects.service";

export async function getProjectsController(req: Request, res: Response) {
	const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
	const result = await getProjectsDashboard(Number(req.userId), cursor);
	return res.status(200).json(result);
}

export async function getProjectByIdController(req: Request, res: Response) {
	const project = await getProjectById(
		Number(req.params.id),
		Number(req.userId),
	);
	return res.status(200).json({ project });
}

export async function createProjectController(req: Request, res: Response) {
	const data = await createProjectSchema.parseAsync(req.body);
	const project = await createProject(Number(req.userId), data);
	return res.status(201).json({ project });
}  
  
export async function updateProjectByIdController(req: Request, res: Response) {
	const projectData = req.body;
	const projectUpdate = await updateProjectById(
		projectData,
		Number(req.params.id),
		Number(req.userId),
	);
	return res.status(200).json({ projectUpdate });
}

export async function deleteProjectByIdController(req: Request, res: Response) {
	await deleteProjectById(Number(req.params.id), Number(req.userId));
	return res.status(204);
}

export async function getOperationsController(req: Request, res: Response) {
	const operations = await getOperationsByUserId(
		Number(req.params.id),
		Number(req.userId),
	);
	return res.status(200).json({ operations });
}

export async function createOperationsController(req: Request, res: Response) {
	const operations = await createOperation(
		Number(req.params.id),
		Number(req.userId),
	);
	return res.status(200).json({ operations });
}
