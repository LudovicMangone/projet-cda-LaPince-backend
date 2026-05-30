import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getProjectById(projectId: number, userId: number) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			appUserId: true,
			name: true,
			description: true,
			isArchived: true,
			projectParticipants: {
				select: {
					participant: {
						select: {
							appUser: {
								select: {
									id: true,
								},
							},
							name: true,
						},
					},
				},
			},
		},
	});

	if (!project) {
		throw new NotFoundError("Project not found");
	}

	// Check that the user is the owner of the project
	const isOwner = userId === project.appUserId;

	if (!isOwner) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	return project;
}
