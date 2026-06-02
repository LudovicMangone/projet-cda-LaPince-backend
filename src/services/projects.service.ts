import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

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
