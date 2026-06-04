import { z } from "zod";

const operationParticipantSchema = z.object({
	participantId: z.number().int().positive(),
	repartitionAmount: z.coerce.number().positive().refine(
		(value) => Number.isInteger(value * 100),
		"Le montant ne peut pas avoir plus de 2 décimales",
	),
});

export const createOperationSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(1000).optional(),
	amount: z.coerce.number().positive().refine(
		(value) => Number.isInteger(value * 100),
		"Le montant ne peut pas avoir plus de 2 décimales",
	),
	date: z.coerce.date(),
	categoryId: z.number().int().positive(),
	projectId: z.number().int().positive(),
	payerParticipantId: z.number().int().positive(),
	operationParticipants: z.array(operationParticipantSchema).optional(),
});

export type CreateOperationInput = z.infer<typeof createOperationSchema>;