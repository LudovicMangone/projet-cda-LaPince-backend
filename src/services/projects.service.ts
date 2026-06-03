import type { Prisma } from "../../generated/prisma";
import { ProjectType } from "../../generated/prisma";
import type { IUpdateProject } from "../@types/projects";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type { CreateProjectInput } from "../schemas/projects.schema";

const typeMap: Record<string, ProjectType> = {
	Voyage: ProjectType.Voyage,
	Maison_Coloc: ProjectType.Maison_Coloc,
	Anniversaire: ProjectType.Anniversaire,
	Repas_Sortie: ProjectType.Repas_Sortie,
	Pro_Travail: ProjectType.Pro_Travail,
	Autre: ProjectType.Autre,
};

export async function createProject(userId: number, data: CreateProjectInput) {
	return prisma.$transaction(async (tx) => {
		const project = await tx.project.create({
			data: {
				name: data.name,
				description: data.description,
				type: typeMap[data.type],
				appUserId: userId,
			},
		});

		if (data.budget) {
			await tx.budget.create({
				data: {
					amount: data.budget.amount,
					limitCriteria: data.budget.alertEnabled
						? data.budget.limitCriteria
						: 100,
					projectId: project.id,
				},
			});
		}

		if (data.participants?.length) {
			for (const p of data.participants) {
				const participant = await tx.participant.create({
					data: { name: p.name },
				});
				await tx.projectParticipant.create({
					data: { projectId: project.id, participantId: participant.id },
				});
			}
		}

		return tx.project.findUnique({
			where: { id: project.id },
			select: {
				id: true,
				name: true,
				description: true,
				type: true,
				isArchived: true,
				createdAt: true,
				budget: { select: { amount: true, limitCriteria: true } },
				projectParticipants: {
					select: {
						participant: { select: { id: true, name: true } },
					},
				},
			},
		});
	});
}

export async function getProjectsDashboard(userId: number, cursor?: number) {
	const take = 5;

	const projects = await prisma.project.findMany({
		where: { appUserId: userId, isArchived: false },
		orderBy: { updatedAt: "desc" },
		take: take + 1,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		select: {
			id: true,
			name: true,
			type: true,
			updatedAt: true,
			_count: {
				select: { operations: true },
			},
			projectParticipants: {
				select: {
					participant: {
						select: {
							id: true,
							name: true,
							appUserId: true,
						},
					},
				},
			},
			budget: {
				select: {
					amount: true,
					limitCriteria: true,
					alerts: {
						where: {
							appUserAlerts: {
								some: { appUserId: userId },
							},
							status: "unread",
						},
						select: { id: true },
					},
				},
			},
			operations: {
				select: { amount: true },
			},
		},
	});

	const hasMore = projects.length > take;
	const data = hasMore ? projects.slice(0, take) : projects;
	const nextCursor = hasMore ? data[data.length - 1].id : null;

	return {
		projects: data.map((project) => {
			const participants = project.projectParticipants.map(
				(pp) => pp.participant,
			);
			const spent = project.operations.reduce(
				(sum, op) => sum + Number(op.amount),
				0,
			);

			return {
				id: project.id,
				name: project.name,
				type: project.type,
				updatedAt: project.updatedAt,
				operationsCount: project._count.operations,
				participants,
				budget: project.budget
					? {
							limit: Number(project.budget.amount),
							limitCriteria: Number(project.budget.limitCriteria),
							spent,
							unreadAlertsCount: project.budget.alerts.length,
						}
					: null,
			};
		}),
		nextCursor,
		hasMore,
	};
}

export async function getProjectById(projectId: number, userId: number) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			id: true,
			appUserId: true,
			name: true,
			description: true,
			isArchived: true,
			type: true,
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

	const dataToUpdate: Prisma.ProjectUpdateInput = {
		name: projectData.name,
		description: projectData.description,
		isArchived: projectData.isArchived,
		type: projectData.type,
	};

	//If user add a budget limit or update it, it add lines in datas:
	if (projectData.budget) {
		dataToUpdate.budget = {
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
		};
	}

	const updateProject = await prisma.project.update({
		where: { id: projectId },
		data: dataToUpdate,
	});
	return {
		project: updateProject,
		budget: projectData.budget,
	};
}

export async function deleteProjectById(projectId: number, userId: number) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
	});
	// Checks before delete
	if (!project) {
		throw new NotFoundError("Project not found");
	}
	const isOwner = userId === project.appUserId;
	if (!isOwner) {
		throw new ForbiddenError("Only the owner of the project can access it");
	}

	const projectDelete = await prisma.project.delete({
		where: { id: projectId },
	});
	return projectDelete;
}
