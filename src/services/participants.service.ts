import type { IParticipant } from "../@types/projects";
import { BadRequestError, ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function updateProjectParticipants(
	participantsData: IParticipant[],
	projectId: number,
	userId: number,
) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
	});
	if (!project) {
		throw new NotFoundError("Project not found");
	}

	// Check that the user is the owner of the project
	const isOwner = userId === project.appUserId;

	if (!isOwner) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	// Search current participants linked to the project
	const currentParticipants = await prisma.projectParticipant.findMany({
		where: { projectId },
		include: {
			participant: true,
		},
	});

	// Build arrays of ids
	const currentIds = currentParticipants.map((cp) => cp.participantId);
	const incomingIds = participantsData.filter((p) => p.id > 0).map((p) => p.id);

	// Detect deleted participants
	const removedParticipantIds = currentIds.filter(
		(id) => !incomingIds.includes(id),
	);

	// Transaction permit to execute multiple action on DB, but if one failed, everything stop et undo what have been done
	const result = await prisma.$transaction(async (tx) => {
		// Update existing participants
		for (const participant of participantsData) {
			const exists = currentIds.includes(participant.id);
			if (exists) {
				await tx.participant.update({
					where: {
						id: participant.id,
					},
					data: {
						name: participant.name,
					},
				});
			}
		}

		// Create new participants
		for (const participant of participantsData) {
			const exists = currentIds.includes(participant.id);

			if (!exists) {
				const newParticipant = await tx.participant.create({
					data: {
						name: participant.name,
					},
				});
				await tx.projectParticipant.create({
					data: {
						projectId,
						participantId: newParticipant.id,
					},
				});
			}
		}

		// Delete removed participants, only if they have no operations

		for (const participantId of removedParticipantIds) {
			// Check whether this participant is referenced
			// in any operation
			const operationsCount = await tx.operationParticipant.count({
				where: {
					participantId,
				},
			});

			if (operationsCount > 0) {
				const participant = await tx.participant.findUnique({
					where: {
						id: participantId,
					},
				});

				throw new BadRequestError(
					`Participant "${participant?.name}" cannot be deleted because they are linked to operations.`,
				);
			}

			// Remove relation with project
			await tx.projectParticipant.delete({
				where: {
					projectId_participantId: {
						projectId,
						participantId,
					},
				},
			});

			// Remove participant record
			await tx.participant.delete({
				where: {
					id: participantId,
				},
			});
		}

		return true;
	});

	return {
		success: result,
	};
}
