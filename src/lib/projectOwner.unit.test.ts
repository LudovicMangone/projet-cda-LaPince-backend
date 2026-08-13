import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { assertProjectOwner } from "../lib/projectOwner";

// ─── Mocks ───────────────────────────────────────────────────
vi.mock("../lib/prisma", () => ({
	prisma: {
		project: {
			findUnique: vi.fn(),
		},
	},
}));

// ─── Setup ───────────────────────────────────────────────────
beforeEach(() => {
	vi.clearAllMocks();
});

// ─── assertProjectOwner ──────────────────────────────────────
describe("[assertProjectOwner]", () => {
	it("should return the project if the user is the owner", async () => {
		// ARRANGE
		vi.mocked(prisma.project.findUnique).mockResolvedValue({
			appUserId: 1,
		} as never);

		// ACT
		const result = await assertProjectOwner(42, 1);

		// ASSERT
		expect(result).toEqual({ appUserId: 1 });
		expect(prisma.project.findUnique).toHaveBeenCalledOnce();
		expect(prisma.project.findUnique).toHaveBeenCalledWith({
			where: { id: 42 },
			select: { appUserId: true },
		});
	});

	it("should throw NotFoundError if project does not exist", async () => {
		// ARRANGE
		vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

		// ACT & ASSERT
		await expect(assertProjectOwner(99, 1)).rejects.toThrow(NotFoundError);
		await expect(assertProjectOwner(99, 1)).rejects.toThrow(
			"Project not found",
		);
	});

	it("should throw ForbiddenError if user is not the owner", async () => {
		// ARRANGE
		vi.mocked(prisma.project.findUnique).mockResolvedValue({
			appUserId: 2,
		} as never);

		// ACT & ASSERT — userId 1 tries to access a project owned by userId 2
		await expect(assertProjectOwner(42, 1)).rejects.toThrow(ForbiddenError);
		await expect(assertProjectOwner(42, 1)).rejects.toThrow(
			"Only the owner of the project can access it",
		);
	});

	it("should use the provided transaction client instead of prisma", async () => {
		// ARRANGE
		const mockTx = {
			project: {
				findUnique: vi.fn().mockResolvedValue({ appUserId: 1 }),
			},
		};

		// ACT
		const result = await assertProjectOwner(42, 1, mockTx as never);

		// ASSERT
		expect(result).toEqual({ appUserId: 1 });
		expect(mockTx.project.findUnique).toHaveBeenCalledOnce();
		// Default prisma client should NOT have been called
		expect(prisma.project.findUnique).not.toHaveBeenCalled();
	});

	it("should throw ForbiddenError via transaction client if user is not the owner", async () => {
		// ARRANGE
		const mockTx = {
			project: {
				findUnique: vi.fn().mockResolvedValue({ appUserId: 99 }),
			},
		};

		// ACT & ASSERT
		await expect(assertProjectOwner(42, 1, mockTx as never)).rejects.toThrow(
			ForbiddenError,
		);
	});
});
