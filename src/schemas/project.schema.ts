import { z } from "zod";

const budgetSchema = z.object({
	amount: z.number().positive(),
	limitCriteria: z.number().min(0).max(100),
});

export const updateProjectSchema = z
	.object({
		name: z.string().min(2).max(100).optional(),
		description: z.string().trim().max(500).optional(),
		isArchived: z.boolean().optional(),
		budget: budgetSchema.optional(),
	})
	.refine(
		(data) =>
			data.name !== undefined ||
			data.description !== undefined ||
			data.isArchived !== undefined ||
			data.budget !== undefined,
		{
			message: "Au moins un champs doit être renseigné",
		},
	);
