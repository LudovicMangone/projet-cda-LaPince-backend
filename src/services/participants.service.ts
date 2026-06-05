import type { IProjectParticipants } from "../@types/projects";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function updateProjectParticipants(
	participantsData: IProjectParticipants,
	projectId: number,
	userId: number,
) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
	});
	// Checks before updating
	if (!project) {
		throw new NotFoundError("Project not found");
	}
	const isOwner = userId === project.appUserId;
	if (!isOwner) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	// const updateProjectParticipants = await prisma.projectParticipant.update({
	// 	where: { id: projectId },
	// 	data: participantsData,
	// });
	return {
		updateProjectParticipants,
	};
}
