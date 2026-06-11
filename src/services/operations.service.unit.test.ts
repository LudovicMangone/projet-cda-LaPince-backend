import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { assertProjectOwner } from "../lib/projectOwner";
import type { CreateOperationInput } from "../schemas/operation.schema";
import { checkAndCreateAlert, resolveAlertIfNeeded } from "./alert.service";
import {
	createOperation,
	deleteOperationsByPojectId,
	getOperationsByPojectId,
	updateOperation,
} from "./operations.service";

vi.mock("../lib/prisma", () => ({
	prisma: {
		$transaction: vi.fn(),
		operation: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("../lib/projectOwner", () => ({
	assertProjectOwner: vi.fn(),
}));

vi.mock("./alert.service", () => ({
	checkAndCreateAlert: vi.fn(),
	resolveAlertIfNeeded: vi.fn(),
}));

const operationInput: CreateOperationInput = {
	projectId: 1,
	name: "Restaurant",
	amount: 100,
	date: new Date("2026-06-11"),
	categoryId: 1,
	payerParticipantId: 1,
	isAmountCalculated: false,
	operationParticipants: [],
};

const operationParticipantInput = {
	participantId: 2,
	repartitionAmount: 50,
	isRepartitionAmountCalculated: false,
};

function createTxMock() {
	return {
		operation: {
			create: vi.fn().mockResolvedValue({ id: 10, name: "Restaurant" }),
			findUnique: vi.fn(),
			update: vi.fn().mockResolvedValue({ id: 10, name: "Courses" }),
			delete: vi.fn().mockResolvedValue({ id: 10 }),
		},
		operationParticipant: {
			createMany: vi.fn().mockResolvedValue({ count: 1 }),
			deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
		},
	};
}

function mockTransaction(txMock: ReturnType<typeof createTxMock>) {
	vi.mocked(prisma.$transaction).mockImplementation((cb: unknown) =>
		(cb as (tx: typeof txMock) => Promise<unknown>)(txMock),
	);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("[getOperationsByPojectId]", () => {
	it("should assert project ownership and return project operations", async () => {
		// ARRANGE
		const operations = [
			{
				id: 1,
				name: "Restaurant",
			},
		];
		vi.mocked(prisma.operation.findMany).mockResolvedValue(operations as never);

		// ACT
		const result = await getOperationsByPojectId(1, 42);

		// ASSERT
		expect(assertProjectOwner).toHaveBeenCalledWith(1, 42);
		expect(prisma.operation.findMany).toHaveBeenCalledWith({
			orderBy: {
				createdAt: "asc",
			},
			where: {
				projectId: 1,
			},
			select: {
				id: true,
				name: true,
				appUserId: true,
				categoryId: true,
				amount: true,
				isAmountCalculated: true,
				date: true,
				payerParticipantId: true,
				appUser: {
					select: {
						id: true,
						name: true,
					},
				},
				operationParticipants: {
					select: {
						repartitionAmount: true,
						isRepartitionAmountCalculated: true,
						participant: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});
		expect(result).toEqual(operations);
	});
});

describe("[createOperation]", () => {
	it("should create an operation and return it", async () => {
		// ARRANGE
		const txMock = createTxMock();
		mockTransaction(txMock);

		// ACT
		const result = await createOperation(operationInput, 42);

		// ASSERT
		expect(assertProjectOwner).toHaveBeenCalledWith(1, 42);
		expect(txMock.operation.create).toHaveBeenCalledWith({
			data: {
				name: "Restaurant",
				amount: 100,
				date: operationInput.date,
				projectId: 1,
				categoryId: 1,
				payerParticipantId: 1,
				isAmountCalculated: false,
				appUserId: 42,
			},
		});
		expect(txMock.operationParticipant.createMany).not.toHaveBeenCalled();
		expect(checkAndCreateAlert).toHaveBeenCalledWith(1, 42, txMock);
		expect(result).toEqual({ id: 10, name: "Restaurant" });
	});

	it("should create operation participants when provided", async () => {
		// ARRANGE
		const txMock = createTxMock();
		mockTransaction(txMock);
		const data = {
			...operationInput,
			operationParticipants: [operationParticipantInput],
		};

		// ACT
		await createOperation(data, 42);

		// ASSERT
		expect(txMock.operationParticipant.createMany).toHaveBeenCalledWith({
			data: [
				{
					operationId: 10,
					participantId: 2,
					repartitionAmount: 50,
					isRepartitionAmountCalculated: false,
				},
			],
		});
	});
});

describe("[updateOperation]", () => {
	it("should update an operation and recreate participants", async () => {
		// ARRANGE
		const txMock = createTxMock();
		txMock.operation.findUnique.mockResolvedValue({
			id: 10,
			projectId: 1,
		});
		mockTransaction(txMock);
		const data = {
			...operationInput,
			name: "Courses",
			operationParticipants: [operationParticipantInput],
		};

		// ACT
		const result = await updateOperation(10, data, 42);

		// ASSERT
		expect(assertProjectOwner).toHaveBeenCalledWith(1, 42);
		expect(txMock.operation.findUnique).toHaveBeenCalledWith({
			where: { id: 10 },
			select: {
				id: true,
				projectId: true,
			},
		});
		expect(txMock.operation.update).toHaveBeenCalledWith({
			where: { id: 10 },
			data: {
				name: "Courses",
				amount: 100,
				date: operationInput.date,
				categoryId: 1,
				payerParticipantId: 1,
				isAmountCalculated: false,
			},
		});
		expect(txMock.operationParticipant.deleteMany).toHaveBeenCalledWith({
			where: { operationId: 10 },
		});
		expect(txMock.operationParticipant.createMany).toHaveBeenCalledWith({
			data: [
				{
					operationId: 10,
					participantId: 2,
					repartitionAmount: 50,
					isRepartitionAmountCalculated: false,
				},
			],
		});
		expect(resolveAlertIfNeeded).toHaveBeenCalledWith(1, 42, txMock);
		expect(checkAndCreateAlert).toHaveBeenCalledWith(1, 42, txMock);
		expect(result).toEqual({ id: 10, name: "Courses" });
	});

	it("should throw NotFoundError when the operation does not exist", async () => {
		// ARRANGE
		const txMock = createTxMock();
		txMock.operation.findUnique.mockResolvedValue(null);
		mockTransaction(txMock);

		// ACT & ASSERT
		await expect(updateOperation(99, operationInput, 42)).rejects.toThrow(
			NotFoundError,
		);
		expect(txMock.operation.update).not.toHaveBeenCalled();
		expect(resolveAlertIfNeeded).not.toHaveBeenCalled();
		expect(checkAndCreateAlert).not.toHaveBeenCalled();
	});

	it("should throw ForbiddenError when the operation belongs to another project", async () => {
		// ARRANGE
		const txMock = createTxMock();
		txMock.operation.findUnique.mockResolvedValue({
			id: 10,
			projectId: 2,
		});
		mockTransaction(txMock);

		// ACT & ASSERT
		await expect(updateOperation(10, operationInput, 42)).rejects.toThrow(
			ForbiddenError,
		);
		expect(txMock.operation.update).not.toHaveBeenCalled();
		expect(txMock.operationParticipant.deleteMany).not.toHaveBeenCalled();
	});
});

describe("[deleteOperationsByPojectId]", () => {
	it("should delete an operation and resolve alert if needed", async () => {
		// ARRANGE
		const txMock = createTxMock();
		mockTransaction(txMock);

		// ACT
		await deleteOperationsByPojectId(
			{
				operationId: 10,
				projectId: 1,
			},
			42,
		);

		// ASSERT
		expect(assertProjectOwner).toHaveBeenCalledWith(1, 42);
		expect(txMock.operation.delete).toHaveBeenCalledWith({
			where: { id: 10, projectId: 1 },
		});
		expect(resolveAlertIfNeeded).toHaveBeenCalledWith(1, 42, txMock);
	});
});
