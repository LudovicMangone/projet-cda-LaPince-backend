import argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { getMe, loginUser, registerUser } from "./auth.service";

// ─── Mocks ───────────────────────────────────────────────────
vi.mock("../lib/prisma", () => ({
	prisma: {
		appUser: {
			findUnique: vi.fn(),
			create: vi.fn(),
		},
		participant: {
			create: vi.fn(),
		},
		project: {
			create: vi.fn(),
		},
		budget: {
			create: vi.fn(),
		},
		alert: {
			create: vi.fn(),
		},
		appUserAlert: {
			create: vi.fn(),
		},
		projectParticipant: {
			createMany: vi.fn(),
		},
		operation: {
			create: vi.fn(),
		},
		operationParticipant: {
			createMany: vi.fn(),
		},
		// Executes the transaction callback with the mock itself as `tx`
		$transaction: vi.fn((cb) =>
			cb({
				appUser: { create: vi.fn() },
				participant: { create: vi.fn() },
				project: { create: vi.fn() },
				budget: { create: vi.fn() },
				alert: { create: vi.fn() },
				appUserAlert: { create: vi.fn() },
				projectParticipant: { createMany: vi.fn() },
				operation: { create: vi.fn() },
				operationParticipant: { createMany: vi.fn() },
			}),
		),
	},
}));

vi.mock("argon2", () => ({
	default: {
		hash: vi.fn().mockResolvedValue("hashed_password"),
		verify: vi.fn(),
	},
}));

vi.mock("jsonwebtoken", () => ({
	default: {
		sign: vi.fn().mockReturnValue("mocked_token"),
	},
}));

// ─── Setup ───────────────────────────────────────────────────
beforeEach(() => {
	vi.clearAllMocks();
	process.env.JWT_SECRET = "test-secret";
});

// ─── registerUser ────────────────────────────────────────────
describe("[registerUser]", () => {
	it("should create and return a user", async () => {
		// ARRANGE
		const mockUser = {
			id: 1,
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "hashed_password",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		vi.mocked(prisma.appUser.findUnique).mockResolvedValue(null);

		// $transaction executes the callback with a tx mock — we capture it
		// and stub tx.appUser.create to return the demo user
		vi.mocked(prisma.$transaction).mockImplementation(async (cb) => {
			const tx = {
				appUser: { create: vi.fn().mockResolvedValue(mockUser) },
				participant: {
					create: vi.fn().mockResolvedValue({ id: 1, name: "Alice" }),
				},
				project: { create: vi.fn().mockResolvedValue({ id: 1, name: "Demo" }) },
				budget: { create: vi.fn().mockResolvedValue({ id: 1 }) },
				alert: { create: vi.fn().mockResolvedValue({ id: 1 }) },
				appUserAlert: { create: vi.fn().mockResolvedValue({}) },
				projectParticipant: { createMany: vi.fn().mockResolvedValue({}) },
				operation: {
					create: vi
						.fn()
						.mockResolvedValue({
							id: 1,
							amount: { div: vi.fn().mockReturnValue(60) },
						}),
				},
				operationParticipant: { createMany: vi.fn().mockResolvedValue({}) },
			};
			return cb(tx);
		});

		// ACT
		const result = await registerUser({
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "Password123",
		});

		// ASSERT — registerUser returns the full transaction result { user, project, budget, alert }
		expect(result.user).toMatchObject({
			id: 1,
			name: "Ludo",
			email: "ludo@lapince.fr",
		});
		expect(prisma.$transaction).toHaveBeenCalledOnce();
	});

	it("should throw ConflictError if email already exists", async () => {
		// ARRANGE
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue({
			id: 1,
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "hashed",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// ACT & ASSERT
		await expect(
			registerUser({
				name: "Ludo",
				email: "ludo@lapince.fr",
				password: "Password123",
			}),
		).rejects.toThrow(ConflictError);
	});
});

// ─── loginUser ───────────────────────────────────────────────
describe("[loginUser]", () => {
	it("should return user and token on valid credentials", async () => {
		// ARRANGE
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue({
			id: 1,
			name: "Steve",
			email: "steve@lapince.fr",
			password: "hashed",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		vi.mocked(argon2.verify).mockResolvedValue(true);

		// ACT
		const result = await loginUser({
			email: "steve@lapince.fr",
			password: "password123",
		});

		// ASSERT
		expect(result.token).toBe("mocked_token");
		expect(result.user).toEqual({
			id: 1,
			name: "Steve",
			email: "steve@lapince.fr",
		});
	});

	it("should throw UnauthorizedError if user not found", async () => {
		// ARRANGE
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue(null);

		// ACT & ASSERT
		await expect(
			loginUser({ email: "unknown@lapince.fr", password: "Password123" }),
		).rejects.toThrow(UnauthorizedError);
	});

	it("should throw UnauthorizedError if password is wrong", async () => {
		// ARRANGE
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue({
			id: 1,
			name: "Steve",
			email: "steve@lapince.fr",
			password: "hashed",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		vi.mocked(argon2.verify).mockResolvedValue(false);

		// ACT & ASSERT
		await expect(
			loginUser({ email: "steve@lapince.fr", password: "WrongPassword1" }),
		).rejects.toThrow(UnauthorizedError);
	});
});

// ─── getMe ───────────────────────────────────────────────────
describe("[getMe]", () => {
	it("should return user by id", async () => {
		// ARRANGE
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue({
			id: 1,
			name: "Steve",
			email: "steve@lapince.fr",
		} as never);

		// ACT
		const result = await getMe(1);

		// ASSERT
		expect(result).toEqual({ id: 1, name: "Steve", email: "steve@lapince.fr" });
	});

	it("should throw UnauthorizedError if user not found", async () => {
		// ARRANGE
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue(null);

		// ACT & ASSERT
		await expect(getMe(99)).rejects.toThrow(UnauthorizedError);
	});
});
