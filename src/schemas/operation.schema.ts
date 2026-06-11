import { z } from "zod";

export const getOperationsSchema = z.object({
	projectId: z.number().int().positive(),
	userId: z.number().int().positive(),
});

const operationParticipantSchema = z.object({
	participantId: z.number().int().positive(),
	isRepartitionAmountCalculated: z.boolean(),
	repartitionAmount: z.coerce
		.number()
		.nonnegative()
		.refine(
			(value) => Number.isInteger(value * 100),
			"Le montant ne peut pas avoir plus de 2 décimales",
		),
});

export const createOperationSchema = z.object({
	name: z.string().min(1).max(100),
	amount: z.coerce
		.number()
		.positive()
		.refine(
			(value) => Number.isInteger(value * 100),
			"Le montant ne peut pas avoir plus de 2 décimales",
		),
	date: z.coerce.date(),
	isAmountCalculated: z.boolean(),
	categoryId: z.number().int().positive(),
	projectId: z.number().int().positive(),
	payerParticipantId: z.number().int().positive(),
	operationParticipants: z.array(operationParticipantSchema).optional(),
});

export const deleteOperationSchema = z.object({
	operationId: z.number().int().positive(),
	projectId: z.number().int().positive(),
});

export type CreateOperationInput = z.infer<typeof createOperationSchema>;
export type DeleteOperationInput = z.infer<typeof deleteOperationSchema>;
