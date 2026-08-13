import type { Request, Response } from "express";
import { projectParamsSchema } from "../schemas/projects.schema";
import {
	getProjectBalance,
	getUserGlobalBalance,
} from "../services/balance.service";

export async function getProjectBalanceController(req: Request, res: Response) {
	const { id } = projectParamsSchema.parse(req.params);
	const result = await getProjectBalance(id, req.userId);
	return res.status(200).json(result);
}

export async function getUserGlobalBalanceController(
	req: Request,
	res: Response,
) {
	const result = await getUserGlobalBalance(req.userId);
	return res.status(200).json(result);
}
