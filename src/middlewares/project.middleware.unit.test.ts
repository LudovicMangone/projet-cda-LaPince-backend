import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import {
	validateProjectParticipantsUpdate,
	validateProjectUpdate,
} from "../../src/middlewares/project.middleware";

// The middleware uses Zod's `.parse()` which throws directly on invalid input.
// Valid payloads → next() is called once, no error thrown.
// Invalid payloads → ZodError is thrown, next() is never called.

describe("validateProjectUpdate", () => {
	// The response object is not used by this middleware,
	// so a minimal mock is enough.
	const res = {} as Response;

	describe("valid payloads — next() must be called, no error thrown", () => {
		it("should call next() when only name is provided", () => {
			// ARRANGE
			const req = { body: { name: "Projet test" } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT — valid input must not throw and must continue the pipeline
			expect(() => validateProjectUpdate(req, res, next)).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});

		it("should call next() when only description is provided", () => {
			// ARRANGE
			const req = { body: { description: "Description du projet" } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});

		it("should call next() when only isArchived is provided", () => {
			// ARRANGE
			const req = { body: { isArchived: true } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});

		it("should call next() when only budget is provided", () => {
			// ARRANGE
			const req = {
				body: { budget: { amount: 1000, limitCriteria: 80 } },
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});

		it("should call next() when only deleteBudget is provided", () => {
			// ARRANGE
			const req = { body: { deleteBudget: true } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});
	});

	describe("invalid payloads — ZodError must be thrown, next() must not be called", () => {
		it("should throw ZodError if no field is provided", () => {
			// ARRANGE — empty body fails the .refine() rule requiring at least one field
			const req = { body: {} } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError if name contains less than 2 characters", () => {
			// ARRANGE
			const req = { body: { name: "A" } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError if name exceeds 100 characters", () => {
			// ARRANGE
			const req = { body: { name: "a".repeat(101) } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError if description exceeds 500 characters", () => {
			// ARRANGE
			const req = { body: { description: "a".repeat(501) } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError if budget.amount is less than or equal to 0", () => {
			// ARRANGE
			const req = {
				body: { budget: { amount: 0, limitCriteria: 50 } },
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError if budget.limitCriteria is less than 0", () => {
			// ARRANGE
			const req = {
				body: { budget: { amount: 100, limitCriteria: -1 } },
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError if budget.limitCriteria exceeds 100", () => {
			// ARRANGE
			const req = {
				body: { budget: { amount: 100, limitCriteria: 101 } },
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectUpdate(req, res, next)).toThrow(ZodError);
			expect(next).not.toHaveBeenCalled();
		});
	});
});

describe("validateProjectParticipantsUpdate", () => {
	const res = {} as Response;

	describe("valid payloads — next() must be called, no error thrown", () => {
		it("should call next() for a valid participants list", () => {
			// ARRANGE
			const req = {
				body: [{ name: "Alice" }, { name: "Bob" }],
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() =>
				validateProjectParticipantsUpdate(req, res, next),
			).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});

		it("should call next() for a participant linked to an application user", () => {
			// ARRANGE — participant with an optional appUser relation
			const req = {
				body: [{ name: "Alice", appUser: { id: 1 } }],
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() =>
				validateProjectParticipantsUpdate(req, res, next),
			).not.toThrow();
			expect(next).toHaveBeenCalledOnce();
		});
	});

	describe("invalid payloads — ZodError must be thrown, next() must not be called", () => {
		it("should throw ZodError when body is not an array", () => {
			// ARRANGE — schema expects an array, not an object
			const req = { body: { name: "Alice" } } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
				ZodError,
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError when participant name is shorter than 2 characters", () => {
			// ARRANGE
			const req = { body: [{ name: "A" }] } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
				ZodError,
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError when participant name exceeds 100 characters", () => {
			// ARRANGE
			const req = { body: [{ name: "a".repeat(101) }] } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
				ZodError,
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError when participant id is invalid (negative number)", () => {
			// ARRANGE — id must be a positive integer per schema
			const req = { body: [{ id: -1, name: "Alice" }] } as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
				ZodError,
			);
			expect(next).not.toHaveBeenCalled();
		});

		it("should throw ZodError when application user id is invalid (negative number)", () => {
			// ARRANGE — appUser.id must be a positive integer per schema
			const req = {
				body: [{ name: "Alice", appUser: { id: -1 } }],
			} as Request;
			const next: NextFunction = vi.fn();

			// ACT & ASSERT
			expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
				ZodError,
			);
			expect(next).not.toHaveBeenCalled();
		});
	});
});
