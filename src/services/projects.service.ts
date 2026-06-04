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
	const [projects, total, userParticipants] = await Promise.all([
		prisma.project.findMany({
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
		}),
		prisma.project.count({
			where: { appUserId: userId, isArchived: false },
		}),
		// Fetch all participants linked to the user to compute per-project balance
		prisma.participant.findMany({
			where: { appUserId: userId },
			select: {
				projectParticipants: {
					select: { projectId: true },
				},
				paidOperations: {
					select: { amount: true, projectId: true },
				},
				operationParticipants: {
					select: {
						repartitionAmount: true,
						operation: { select: { projectId: true } },
					},
				},
			},
		}),
	]);

	// Build a lookup map: projectId → user's net balance in that project
	// balance > 0 : the user is owed money
	// balance < 0 : the user owes money
	// balance = 0 : settled
	const userBalanceByProject: Record<number, number> = {};

	for (const participant of userParticipants) {
		for (const pp of participant.projectParticipants) {
			// Sum all amounts paid by the user in this specific project
			const totalPaid = participant.paidOperations
				.filter((op) => op.projectId === pp.projectId)
				.reduce((sum, op) => sum + Number(op.amount), 0);

			// Sum all amounts the user owes in this specific project
			const totalOwed = participant.operationParticipants
				.filter((op) => op.operation.projectId === pp.projectId)
				.reduce((sum, op) => sum + Number(op.repartitionAmount), 0);

			// Round to 2 decimal places to avoid floating point issues (e.g. 36.330000001)
			userBalanceByProject[pp.projectId] =
				Math.round((totalPaid - totalOwed) * 100) / 100;
		}
	}
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
				// User's net balance in this project (null if not a participant)
				userBalance: userBalanceByProject[project.id] ?? null,
			};
		}),
		nextCursor,
		hasMore,
		total,
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
							id: true,
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
