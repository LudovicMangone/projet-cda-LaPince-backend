import { prisma } from "../lib/prisma";
import { assertProjectOwner } from "../lib/projectOwner";

export async function getProjectBudgets(projectId: number, userId: number) {
	await assertProjectOwner(projectId, userId);

	const budget = await prisma.budget.findUnique({
		where: { projectId },
		select: { amount: true, limitCriteria: true },
	});

	const operationsByCategory = await prisma.operation.groupBy({
		by: ["categoryId"],
		where: { projectId },
		_sum: { amount: true },
	});

	const categoryIds = operationsByCategory.map((op) => op.categoryId);

	const categories = await prisma.category.findMany({
		where: { id: { in: categoryIds } },
		select: { id: true, name: true, color: true },
	});

	const categoryMap = new Map(categories.map((c) => [c.id, c]));

	const spentByCategory = operationsByCategory.map((op) => {
		const category = categoryMap.get(op.categoryId);
		return {
			categoryId: op.categoryId,
			categoryName: category?.name ?? "Inconnu",
			color: category?.color ?? "#000000",
			spent: Number(op._sum.amount ?? 0),
		};
	});

	const totalSpent = spentByCategory.reduce((sum, c) => sum + c.spent, 0);

	return {
		totalSpent,
		totalLimit: budget ? Number(budget.amount) : null,
		alertThreshold: budget ? Number(budget.limitCriteria) : null,
		spentByCategory,
	};
}
