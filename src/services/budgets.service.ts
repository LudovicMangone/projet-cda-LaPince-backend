import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getProjectBudgets(projectId: number, userId: number) {
	// 1. Vérifier existence + accès
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			appUserId: true,
			budget: {
				select: {
					amount: true,
					limitCriteria: true,
				},
			},
		},
	});

	if (!project) {
		throw new NotFoundError("Projet introuvable");
	}

	if (project.appUserId !== userId) {
		throw new ForbiddenError("Accès refusé à ce projet");
	}

	// 2. Dépenses groupées par catégorie
	const operationsByCategory = await prisma.operation.groupBy({
		by: ["categoryId"],
		where: { projectId },
		_sum: { amount: true },
	});

	// 3. Récupérer les noms et couleurs des catégories concernées
	const categoryIds = operationsByCategory.map((op) => op.categoryId);

	const categories = await prisma.category.findMany({
		where: { id: { in: categoryIds } },
		select: { id: true, name: true, color: true },
	});

	// Map categoryId → category pour lookup O(1)
	const categoryMap = new Map(categories.map((c) => [c.id, c]));

	// 4. Assembler spentByCategory
	const spentByCategory = operationsByCategory.map((op) => {
		const category = categoryMap.get(op.categoryId);
		return {
			categoryId: op.categoryId,
			categoryName: category?.name ?? "Inconnu",
			color: category?.color ?? "#000000",
			spent: Number(op._sum.amount ?? 0),
		};
	});

	// 5. Total dépensé
	const totalSpent = spentByCategory.reduce((sum, c) => sum + c.spent, 0);

	return {
		totalSpent,
		totalLimit: project.budget ? Number(project.budget.amount) : null,
		alertThreshold: project.budget
			? Number(project.budget.limitCriteria)
			: null,
		spentByCategory,
	};
}