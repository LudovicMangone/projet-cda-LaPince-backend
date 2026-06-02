import type { Request, Response } from "express";
import { projectParamsSchema } from "../schemas/projects.schema";
import { getProjectBalance } from "../services/balance.service";

export async function getProjectBalanceController(
	req: Request,
	res: Response,
) {
	const { id } = projectParamsSchema.parse(req.params);
	const result = await getProjectBalance(id, req.userId);
	return res.status(200).json(result);
}