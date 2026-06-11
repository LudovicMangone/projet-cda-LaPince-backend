import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { BadRequestError } from "../../src/lib/errors";
import { validateProjectUpdate } from "../../src/middlewares/project.middleware";

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
		});
	});

	describe("invalid payloads", () => {
		it("should throw if no field is provided", () => {
			// ARRANGE
			const req = {
				body: {},
			} as Request;

			// Mock next() because Express normally injects it.
			// It should never be called when validation fails.
			const next: NextFunction = vi.fn();

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				"Au moins un champs doit être renseigné",
			);
		});

		it("should throw if name contains less than 2 characters", () => {
			// ARRANGE
			const req = {
				body: {
					name: "A",
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
		});

		it("should throw if name exceeds 100 characters", () => {
			// ARRANGE
			const req = {
				body: {
					name: "a".repeat(101),
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
		});

		it("should throw if description exceeds 500 characters", () => {
			// ARRANGE
			const req = {
				body: {
					description: "a".repeat(501),
				},
			} as Request;

			const next: NextFunction = vi.fn();

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
		});

		it("should throw if budget.amount is less than or equal to 0", () => {
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

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
		});

		it("should throw if budget.limitCriteria is less than 0", () => {
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

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
		});

		it("should throw if budget.limitCriteria exceeds 100", () => {
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

			// ACT + ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(
				BadRequestError,
			);
		});
	});
});
