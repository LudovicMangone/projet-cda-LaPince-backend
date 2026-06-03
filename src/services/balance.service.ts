import { ForbiddenError, NotFoundError } from "../lib/errors";
import { computeReimbursements } from "../lib/greedy";
import { prisma } from "../lib/prisma";

export async function getProjectBalance(projectId: number, userId: number) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: { appUserId: true },
	});

	if (!project) {
		throw new NotFoundError("Projet introuvable");
	}

	if (project.appUserId !== userId) {
		throw new ForbiddenError("Accès refusé à ce projet");
	}

	const participants = await prisma.participant.findMany({
		where: {
			projectParticipants: {
				some: { projectId },
			},
		},
		select: {
			id: true,
			name: true,
			paidOperations: {
				where: { projectId },
				select: { amount: true },
			},
			operationParticipants: {
				where: { operation: { projectId } },
				select: { repartitionAmount: true },
			},
		},
	});

	const balances = participants.map((p) => {
		const totalPaid = p.paidOperations.reduce(
			(sum, op) => sum + Number(op.amount),
			0,
		);
		const totalOwed = p.operationParticipants.reduce(
			(sum, op) => sum + Number(op.repartitionAmount),
			0,
		);

		return {
			name: p.name,
			amount: Math.round((totalPaid - totalOwed) * 100) / 100,
		};
	});

	return computeReimbursements(balances);
}
