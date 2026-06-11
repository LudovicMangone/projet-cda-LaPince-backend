import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import {
	validateProjectParticipantsUpdate,
	validateProjectUpdate,
} from "../../src/middlewares/project.middleware";

describe("validateProjectUpdate", () => {
	// The response object is not used by this middleware,
	// so a minimal mock is enough.
	const res = {} as Response;

	describe("valid payloads", () => {
		it("should validate update with only name", () => {
			// ARRANGE
			const req = {
				body: {
					name: "Projet test",
				},
			} as Request;

			// Mock Express next() to verify the middleware
			// continues the request lifecycle when validation succeeds.
			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith();
		});

		it("should validate update with only description", () => {
			// ARRANGE
			const req = {
				body: {
					description: "Description du projet",
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith();
		});

		it("should validate update with only isArchived", () => {
			// ARRANGE
			const req = {
				body: {
					isArchived: true,
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith();
		});

		it("should validate update with only budget", () => {
			// ARRANGE
			const req = {
				body: {
					budget: {
						amount: 1000,
						limitCriteria: 80,
					},
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith();
		});

		it("should validate update with only deleteBudget", () => {
			// ARRANGE
			const req = {
				body: {
					deleteBudget: true,
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith();
		});
	});

	describe("invalid payloads", () => {
		it("should forward a ZodError to next if no field is provided", () => {
			// ARRANGE
			const req = {
				body: {},
			} as Request;

			// Mock next() to capture the error forwarded by the middleware
			// instead of throwing it directly.
			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT — next must be called once with a ZodError
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should forward a ZodError to next if name contains less than 2 characters", () => {
			// ARRANGE
			const req = {
				body: {
					name: "A",
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should forward a ZodError to next if name exceeds 100 characters", () => {
			// ARRANGE
			const req = {
				body: {
					name: "a".repeat(101),
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should forward a ZodError to next if description exceeds 500 characters", () => {
			// ARRANGE
			const req = {
				body: {
					description: "a".repeat(501),
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should forward a ZodError to next if budget.amount is less than or equal to 0", () => {
			// ARRANGE
			const req = {
				body: {
					budget: {
						amount: 0,
						limitCriteria: 50,
					},
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should forward a ZodError to next if budget.limitCriteria is less than 0", () => {
			// ARRANGE
			const req = {
				body: {
					budget: {
						amount: 100,
						limitCriteria: -1,
					},
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should forward a ZodError to next if budget.limitCriteria exceeds 100", () => {
			// ARRANGE
			const req = {
				body: {
					budget: {
						amount: 100,
						limitCriteria: 101,
					},
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT
			validateProjectUpdate(req, res, next);

			// ASSERT
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(ZodError));
		});
	});
});

describe("validateProjectParticipantsUpdate", () => {
	it("should validate a valid participants list", () => {
		// ARRANGE
		const req = {
			body: [
				{
					name: "Alice",
				},
				{
					name: "Bob",
				},
			],
		} as Request;

		const res = {} as Response;

		// Mock next() to verify that the middleware allows the request
		// to continue when validation succeeds.
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith();
	});

	it("should validate a participant linked to an application user", () => {
		// ARRANGE
		const req = {
			body: [
				{
					name: "Alice",
					appUser: {
						id: 1,
					},
				},
			],
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith();
	});

	it("should forward a ZodError to next when body is not an array", () => {
		// ARRANGE
		const req = {
			body: {
				name: "Alice",
			},
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith(expect.any(ZodError));
	});

	it("should forward a ZodError to next when participant name is shorter than 2 characters", () => {
		// ARRANGE
		const req = {
			body: [
				{
					name: "A",
				},
			],
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith(expect.any(ZodError));
	});

	it("should forward a ZodError to next when participant name exceeds 100 characters", () => {
		// ARRANGE
		const req = {
			body: [
				{
					name: "a".repeat(101),
				},
			],
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith(expect.any(ZodError));
	});

	it("should forward a ZodError to next when participant id is invalid", () => {
		// ARRANGE
		const req = {
			body: [
				{
					id: -1,
					name: "Alice",
				},
			],
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith(expect.any(ZodError));
	});

	it("should forward a ZodError to next when application user id is invalid", () => {
		// ARRANGE
		const req = {
			body: [
				{
					name: "Alice",
					appUser: {
						id: -1,
					},
				},
			],
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT
		validateProjectParticipantsUpdate(req, res, next);

		// ASSERT
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith(expect.any(ZodError));
	});
});
