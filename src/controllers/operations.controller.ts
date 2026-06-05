import type { Request, Response } from "express";
import { createOperationSchema } from "../schemas/operation.schema";
import {
	createOperation,
	getOperationsByPojectId,
	updateOperation,
} from "../services/operations.service";

export async function getOperationsController(req: Request, res: Response) {
	const operations = await getOperationsByPojectId(
		Number(req.params.id),
		Number(req.userId),
	);
	return res.status(200).json({ operations });
}

export async function createOperationsController(req: Request, res: Response) {
	const data = await createOperationSchema.parseAsync(req.body);

	const operations = await createOperation(data, Number(req.userId));
	return res.status(200).json({ operations });
}

export async function updateOperationsController(req: Request, res: Response) {
	const data = await createOperationSchema.parseAsync(req.body);
	const operationId = Number(req.params.operationId);

	const operations = await updateOperation(
		operationId,
		data,
		Number(req.userId),
	);
	return res.status(200).json({ operations });
}
