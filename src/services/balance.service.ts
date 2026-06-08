import { ForbiddenError, NotFoundError } from "../lib/errors";
import { computeReimbursements } from "../lib/greedy";
import { prisma } from "../lib/prisma";

// Phase 1 — Compute the net balance of each participant in a project.
// balance > 0 : creditor (should receive money)
// balance < 0 : debtor (owes money)
// balance = 0 : settled
export async function computeProjectBalances(projectId: number) {
	const participants = await prisma.participant.findMany({
		where: {
			projectParticipants: {
				some: { projectId },
			},
		},
		select: {
			id: true,
			name: true,
			appUserId: true,
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

	return participants.map((p) => {
		const totalPaid = p.paidOperations.reduce(
			(sum, op) => sum + Number(op.amount),
			0,
		);
		const totalOwed = p.operationParticipants.reduce(
			(sum, op) => sum + Number(op.repartitionAmount),
			0,
		);

		return {
			participantId: p.id,
			appUserId: p.appUserId,
			name: p.name,
			balance: Math.round((totalPaid - totalOwed) * 100) / 100,
		};
	});
}

// Phase 2 — Run the greedy algorithm on Phase 1 balances
// to produce the minimum number of reimbursement transactions.
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

	const balances = await computeProjectBalances(projectId);

	// computeReimbursements expects { name, amount } — map from Phase 1 shape
	return computeReimbursements(
		balances.map((b) => ({ name: b.name, amount: b.balance })),
	);
}

// Compute the global balance of the connected user across all their projects
export async function getUserGlobalBalance(userId: number) {
	// Fetch all projects owned by the user
	const projects = await prisma.participant.findMany({
		where: { appUserId: userId },
		select: { id: true },
	});

	let totalToDo = 0;
	let totalToReceive = 0;

	for (const project of projects) {
		// Compute per-participant balances for this project
		const balances = await computeProjectBalances(project.id);

		// Only look at participants linked to the connected user
		for (const balance of balances) {
			if (balance.appUserId === userId) {
				if (balance.balance < 0) {
					// User owes money in this project
					totalToDo += Math.abs(balance.balance);
				} else if (balance.balance > 0) {
					// User is owed money in this project
					totalToReceive += balance.balance;
				}
			}
		}
	}


	const toDo = Math.round(totalToDo * 100) / 100;
	const toReceive = Math.round(totalToReceive * 100) / 100;
	const netBalance = Math.round((toReceive - toDo) * 100) / 100;

	return { toDo, toReceive, netBalance };
}
