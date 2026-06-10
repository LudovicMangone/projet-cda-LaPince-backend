import type { Prisma } from "../../generated/prisma";
import { ForbiddenError, NotFoundError } from "./errors";
import { prisma } from "./prisma";

// Checks that the project exists and that the user is its owner.
// Throws NotFoundError or ForbiddenError otherwise.
// Accepts an optional transaction client (tx) for use inside Prisma transactions.
export async function assertProjectOwner(
	projectId: number,
	userId: number,
	client: Prisma.TransactionClient | typeof prisma = prisma,
) {
	const project = await client.project.findUnique({
		where: { id: projectId },
		select: { appUserId: true },
	});

	if (!project) throw new NotFoundError("Project not found");

	if (project.appUserId !== userId)
		throw new ForbiddenError("Only the owner of the project can access it");

	return project;
}