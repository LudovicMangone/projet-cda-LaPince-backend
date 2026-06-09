import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
	CreateOperationInput,
	DeleteOperationInput,
} from "../schemas/operation.schema";

export async function getOperationsByPojectId(
	projectId: number,
	userId: number,
) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: { appUserId: true },
	});

	if (!project) {
		throw new NotFoundError("Project not found");
	}

	if (project.appUserId !== userId) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	const operations = await prisma.operation.findMany({
		orderBy: {
			date: "asc",
		},
		where: {
			projectId,
		},
		select: {
			id: true,
			name: true,
			appUserId: true,
			categoryId: true,
			amount: true,
			isAmountCalculated: true,
			date: true,
			payerParticipantId: true,
			appUser: {
				select: {
					id: true,
					name: true,
				},
			},
			operationParticipants: {
				select: {
					repartitionAmount: true,
					isRepartitionAmountCalculated: true,
					participant: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	});

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
				isAmountCalculated: data.isAmountCalculated,
				appUserId: userId,
			},
		});
		if (data.operationParticipants?.length) {
			await tx.operationParticipant.createMany({
				data: data.operationParticipants.map((participant) => ({
					operationId: operation.id,
					participantId: participant.participantId,
					repartitionAmount: participant.repartitionAmount,
					isRepartitionAmountCalculated:
						participant.isRepartitionAmountCalculated,
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
				isAmountCalculated: data.isAmountCalculated,
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
					isRepartitionAmountCalculated:
						participant.isRepartitionAmountCalculated,
				})),
			});
		}

		return updatedOperation;
	});
}

export async function deleteOperationsByPojectId(data: DeleteOperationInput) {
	await prisma.operation.delete({
		where: {
			id: data.operationId,
			projectId: data.projectId,
		},
	});
}
