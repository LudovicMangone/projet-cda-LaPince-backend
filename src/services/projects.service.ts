import { NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getProjectById(projectId: number) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			name: true,
			description: true,
			isArchived: true,
			projectParticipants: {
				select: {
					participant: {
						select: {
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

	return project;
}
