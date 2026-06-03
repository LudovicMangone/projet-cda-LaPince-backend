import type { Request, Response } from "express";
import { projectParamsSchema } from "../schemas/projects.schema";
import { getProjectBudgets } from "../services/budgets.service";

export async function getProjectBudgetsController(req: Request, res: Response) {
	const { id } = projectParamsSchema.parse(req.params);
	const result = await getProjectBudgets(id, req.userId);
	return res.status(200).json(result);
}
