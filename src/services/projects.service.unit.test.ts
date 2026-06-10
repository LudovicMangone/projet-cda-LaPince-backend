import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../lib/prisma";
import {
	createProject,
	getProjectsDashboard,
} from "./projects.service";

// ─── Mocks ───────────────────────────────────────────────────
vi.mock("../lib/prisma", () => ({
	prisma: {
		$transaction: vi.fn(),
		project: {
			findMany: vi.fn(),
			count: vi.fn(),
		},
		participant: {
			findMany: vi.fn(),
		},
	},
}));

// ─── Setup ───────────────────────────────────────────────────
beforeEach(() => {
	vi.clearAllMocks();
});

// ─── createProject ───────────────────────────────────────────
describe("[createProject]", () => {
	it("should create a project and return it", async () => {
		// ARRANGE
		const txMock = {
			project: {
				create: vi.fn().mockResolvedValue({ id: 1 }),
				findUnique: vi.fn().mockResolvedValue({
					id: 1,
					name: "Voyage à Barcelone",
					description: null,
					type: "Voyage",
					isArchived: false,
					createdAt: new Date(),
					budget: null,
					projectParticipants: [],
				}),
			},
		};
		vi.mocked(prisma.$transaction).mockImplementation(
			(cb: unknown) => (cb as (tx: typeof txMock) => Promise<unknown>)(txMock),
		);

		// ACT
		const result = await createProject(42, {
			name: "Voyage à Barcelone",
			type: "Voyage",
		});

		// ASSERT
		expect(txMock.project.create).toHaveBeenCalledOnce();
		expect(result).toHaveProperty("id", 1);
	});

	it("should create a project with budget when provided", async () => {
		// ARRANGE
		const txMock = {
			project: {
				create: vi.fn().mockResolvedValue({ id: 2 }),
				findUnique: vi.fn().mockResolvedValue({ id: 2, name: "Weekend" }),
			},
			budget: {
				create: vi.fn().mockResolvedValue({}),
			},
		};
		vi.mocked(prisma.$transaction).mockImplementation(
			(cb: unknown) => (cb as (tx: typeof txMock) => Promise<unknown>)(txMock),
		);

		// ACT
		await createProject(42, {
			name: "Weekend",
			type: "Voyage",
			budget: { amount: 500, alertEnabled: true, limitCriteria: 80 },
		});

		// ASSERT
		expect(txMock.budget.create).toHaveBeenCalledOnce();
		expect(txMock.budget.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ amount: 500, limitCriteria: 80 }),
			}),
		);
	});

	it("should set limitCriteria to 100 when alertEnabled is false", async () => {
		// ARRANGE
		const txMock = {
			project: {
				create: vi.fn().mockResolvedValue({ id: 3 }),
				findUnique: vi.fn().mockResolvedValue({ id: 3, name: "Budget" }),
			},
			budget: {
				create: vi.fn().mockResolvedValue({}),
			},
		};
		vi.mocked(prisma.$transaction).mockImplementation(
			(cb: unknown) => (cb as (tx: typeof txMock) => Promise<unknown>)(txMock),
		);

		// ACT
		await createProject(42, {
			name: "Budget",
			type: "Voyage",
			budget: { amount: 200, alertEnabled: false, limitCriteria: 80 },
		});

		// ASSERT
		expect(txMock.budget.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ limitCriteria: 100 }),
			}),
		);
	});
});

// ─── getProjectsDashboard ────────────────────────────────────
describe("[getProjectsDashboard]", () => {
	const mockProjectRow = {
		id: 1,
		name: "Voyage",
		type: "Voyage",
		isArchived: false,
		updatedAt: new Date(),
		_count: { operations: 3 },
		projectParticipants: [{ participant: { id: 10, name: "Alice", appUserId: 42 } }],
		budget: null,
		operations: [{ amount: 100 }, { amount: 50 }],
	};

	it("should return paginated projects with userBalance", async () => {
		// ARRANGE
		vi.mocked(prisma.project.findMany).mockResolvedValue([mockProjectRow] as never);
		vi.mocked(prisma.project.count).mockResolvedValue(1);
		vi.mocked(prisma.participant.findMany).mockResolvedValue([
			{
				projectParticipants: [{ projectId: 1 }],
				paidOperations: [{ amount: 100, projectId: 1 }],
				operationParticipants: [
					{ repartitionAmount: 50, operation: { projectId: 1 } },
				],
			},
		] as never);

		// ACT
		const result = await getProjectsDashboard(42);

		// ASSERT
		expect(result.projects).toHaveLength(1);
		expect(result.total).toBe(1);
		expect(result.hasMore).toBe(false);
		expect(result.nextCursor).toBeNull();
		expect(result.projects[0].userBalance).toBe(50);
	});

	it("should set hasMore and nextCursor when more pages exist", async () => {
		// ARRANGE — 6 rows returned for take=5+1
		const rows = Array.from({ length: 6 }, (_, i) => ({
			...mockProjectRow,
			id: i + 1,
		}));
		vi.mocked(prisma.project.findMany).mockResolvedValue(rows as never);
		vi.mocked(prisma.project.count).mockResolvedValue(10);
		vi.mocked(prisma.participant.findMany).mockResolvedValue([] as never);

		// ACT
		const result = await getProjectsDashboard(42);

		// ASSERT
		expect(result.projects).toHaveLength(5);
		expect(result.hasMore).toBe(true);
		expect(result.nextCursor).toBe(5);
	});

	it("should return null userBalance when user is not a participant", async () => {
		// ARRANGE
		vi.mocked(prisma.project.findMany).mockResolvedValue([mockProjectRow] as never);
		vi.mocked(prisma.project.count).mockResolvedValue(1);
		vi.mocked(prisma.participant.findMany).mockResolvedValue([] as never);

		// ACT
		const result = await getProjectsDashboard(99);

		// ASSERT
		expect(result.projects[0].userBalance).toBeNull();
	});
});

