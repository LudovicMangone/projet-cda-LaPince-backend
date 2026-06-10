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
		vi.mocked(prisma.appUser.findUnique).mockResolvedValue(null);
		vi.mocked(prisma.appUser.create).mockResolvedValue({
			id: 1,
			name: "Ludo",
			email: "ludo@lapince.fr",
		} as never);

		// ACT
		const result = await registerUser({
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "Password123",
		});

		// ASSERT
		expect(result).toEqual({ id: 1, name: "Ludo", email: "ludo@lapince.fr" });
		expect(prisma.appUser.create).toHaveBeenCalledOnce();
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
