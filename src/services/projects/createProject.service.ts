import { prisma } from "../../lib/prisma";
import type { CreateProjectInput } from "../../schemas/projects.schema";

export async function createProject(userId: number, data: CreateProjectInput) {
	return prisma.$transaction(async (tx) => {
		const project = await tx.project.create({
			data: {
				name: data.name,
				description: data.description,
				type: data.type,
				appUserId: userId,
			},
		});

		if (data.budget) {
			await tx.budget.create({
				data: {
					amount: data.budget.amount,
					limitCriteria: data.budget.alertEnabled
						? data.budget.limitCriteria
						: 100,
					projectId: project.id,
				},
			});
		}

		if (data.participants?.length) {
			for (const p of data.participants) {
				const participant = await tx.participant.create({
					data: { name: p.name },
				});
				await tx.projectParticipant.create({
					data: { projectId: project.id, participantId: participant.id },
				});
			}
		}

		return tx.project.findUnique({
			where: { id: project.id },
			select: {
				id: true,
				name: true,
				description: true,
				type: true,
				isArchived: true,
				createdAt: true,
				budget: { select: { amount: true, limitCriteria: true } },
				projectParticipants: {
					select: {
						participant: { select: { id: true, name: true } },
					},
				},
			},
		});
	});
}
