import type { IProjectDetails, IUpdateProject } from "../@types/projects";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getProjectById(projectId: number, userId: number) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			id: true,
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
			budget: {
				select: {
					id: true,
					amount: true,
					limitCriteria: true,
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

export async function updateProjectById(
	projectData: IUpdateProject,
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

	const updatingData = await prisma.project.update({
		where: { id: projectId },
		data: {
			name: projectData.name,
			description: projectData.description,
			isArchived: projectData.isArchived,

			//If user add a budget limit or update it
			...(projectData.budget && {
				budget: {
					upsert: {
						create: {
							amount: projectData.budget.amount,
							limitCriteria: projectData.budget.limitCriteria,
						},
						update: {
							amount: projectData.budget.amount,
							limitCriteria: projectData.budget.limitCriteria,
						},
					},
				},
			}),
		},
	});
	console.log(updatingData, projectData.budget);
}
