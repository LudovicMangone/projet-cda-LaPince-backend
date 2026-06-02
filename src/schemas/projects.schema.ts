import { z } from "zod";

const projectTypeEnum = z.enum([
    "Voyage", "Maison / Coloc", "Anniversaire", "Repas / Sortie", "Pro / Travail", "Autre"
]);

const participantSchema = z.object({
    name: z.string().min(1).max(100),
});

const budgetSchema = z.object({
    amount: z.number().positive(),
    alertEnabled: z.boolean().default(false),
    limitCriteria: z.number().min(1).max(100).default(80),
});

export const createProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    type: projectTypeEnum.default("Voyage"),
    budget: budgetSchema.optional(),
    participants: z.array(participantSchema).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;