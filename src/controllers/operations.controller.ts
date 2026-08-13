import type { Request, Response } from "express";
import {
	createOperationSchema,
	deleteOperationSchema,
	getOperationsSchema,
} from "../schemas/operation.schema";
import {
	createOperation,
	deleteOperationsByPojectId,
	getOperationsByPojectId,
	updateOperation,
} from "../services/operations.service";

export async function getOperationsController(req: Request, res: Response) {
	const data = await getOperationsSchema.parseAsync({
		projectId: Number(req.params.id),
		userId: Number(req.userId),
	});

	const operations = await getOperationsByPojectId(data.projectId, data.userId);
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

export async function deleteOperationsController(req: Request, res: Response) {
	const data = await deleteOperationSchema.parseAsync({
		projectId: Number(req.params.id),
		operationId: Number(req.params.operationId),
	});

	await deleteOperationsByPojectId(data, Number(req.userId));
	return res.status(204).send();
}
