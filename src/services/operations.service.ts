import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type { CreateOperationInput } from "../schemas/operation.schema";

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

export async function createOperation(
	data: CreateOperationInput,
	userId: number,
) {
	return prisma.$transaction(async (tx) => {
		const operation = await tx.operation.create({
			data: {
				name: data.name,
				amount: data.amount,
				date: data.date,
				projectId: data.projectId,
				categoryId: data.categoryId,
				payerParticipantId: data.payerParticipantId,
				appUserId: userId,
			},
		});
		if (data.operationParticipants?.length) {
			await tx.operationParticipant.createMany({
				data: data.operationParticipants.map((participant) => ({
					operationId: operation.id,
					participantId: participant.participantId,
					repartitionAmount: participant.repartitionAmount,
				})),
			});
		}
		return operation;
	});
}

export async function updateOperation(
	operationId: number,
	data: CreateOperationInput,
	userId: number,
) {
	return prisma.$transaction(async (tx) => {
		const operation = await tx.operation.findUnique({
			where: { id: operationId },
			select: {
				id: true,
				projectId: true,
				appUserId: true,
			},
		});

		if (!operation) {
			throw new NotFoundError("Operation not found");
		}

		if (operation.appUserId !== userId) {
			throw new ForbiddenError("Only the owner can update this operation");
		}

		const updatedOperation = await tx.operation.update({
			where: { id: operationId },
			data: {
				name: data.name,
				amount: data.amount,
				date: data.date,
				projectId: data.projectId,
				categoryId: data.categoryId,
				payerParticipantId: data.payerParticipantId,
			},
		});

		// Remove all existing participants before recreating them
		// it avoid to duplicate an operation
		await tx.operationParticipant.deleteMany({
			where: { operationId },
		});

		if (data.operationParticipants?.length) {
			await tx.operationParticipant.createMany({
				data: data.operationParticipants.map((participant) => ({
					operationId,
					participantId: participant.participantId,
					repartitionAmount: participant.repartitionAmount,
				})),
			});
		}

		return updatedOperation;
	});
}
