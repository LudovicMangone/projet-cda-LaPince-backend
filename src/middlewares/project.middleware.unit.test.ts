import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { BadRequestError } from "../../src/lib/errors";
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
	});

	it("should throw an error when body is not an array", () => {
		// ARRANGE
		const req = {
			body: {
				name: "Alice",
			},
		} as Request;

		const res = {} as Response;
		const next: NextFunction = vi.fn();

		// ACT / ASSERT
		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			BadRequestError,
		);

		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			"Invalid input: expected array, received object",
		);
	});

	it("should throw an error when participant name is shorter than 2 characters", () => {
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

		// ACT / ASSERT
		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			BadRequestError,
		);

		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			"Au moins deux lettres doivent être renseignées",
		);
	});

	it("should throw an error when participant name exceeds 100 characters", () => {
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

		// ACT / ASSERT
		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			BadRequestError,
		);

		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow();
	});

	it("should throw an error when participant id is invalid", () => {
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

		// ACT / ASSERT
		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			BadRequestError,
		);

		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow();
	});

	it("should throw an error when application user id is invalid", () => {
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

		// ACT / ASSERT
		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow(
			BadRequestError,
		);

		expect(() => validateProjectParticipantsUpdate(req, res, next)).toThrow();
	});
});
