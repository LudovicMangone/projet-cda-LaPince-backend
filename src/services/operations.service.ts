import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getOperationsByPojectId(
	projectId: number,
	userId: number,
) {
	const operations = await prisma.operation.findMany({
		where: {
			projectId: projectId,
		},
		select: {
			id: true,
			name: true,
			appUserId: true,
			categoryId: true,
			amount: true,
			date: true,
			payerParticipantId: true,
			appUser: {
				select: {
					name: true,
					id: true,
				},
			},
			operationParticipants: {
				select: {
					repartitionAmount: true,
					participant: {
						select: {
							name: true,
							id: true,
						},
					},
				},
			},
		},
	});

	if (!operations) {
		throw new NotFoundError("Operations not found");
	}

	// Check that the user is the owner of the project
	const isOwner = userId === operations[0].appUserId;

	if (!isOwner) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	return operations;
}

export async function createOperation(projectId: number, userId: number) {
	const operations = await prisma.operation.findMany({
		where: {
			projectId: projectId,
		},
		select: {
			id: true,
			appUserId: true,
			name: true,
			categoryId: true,
			amount: true,
			date: true,
			payerParticipantId: true,
			appUser: {
				select: {
					name: true,
					id: true,
				},
			},
			operationParticipants: {
				select: {
					participant: {
						select: {
							name: true,
							id: true,
						},
					},
				},
			},
		},
	});

	if (!operations) {
		throw new NotFoundError("Operations not found");
	}

	// Check that the user is the owner of the project
	const isOwner = userId === operations[0].appUserId;

	if (!isOwner) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	return operations;
}
