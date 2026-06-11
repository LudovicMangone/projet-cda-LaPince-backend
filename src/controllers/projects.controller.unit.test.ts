import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	deleteProjectByIdController,
	getProjectByIdController,
	updateProjectByIdController,
	updateProjectParticipantsController,
} from "../../src/controllers/projects.controller";

import { updateProjectParticipants } from "../../src/services/participants.service";
import {
	deleteProjectById,
	getProjectById,
	updateProjectById,
} from "../../src/services/projects.service";

// Mock the project service layer to isolate controller tests.
//
// We do not want to execute the real service logic, access the database,
// or depend on external systems. These mocks allow us to verify that the
// controller calls the correct service methods with the expected arguments.
vi.mock("../../src/services/projects.service", () => ({
	getProjectById: vi.fn(),
	updateProjectById: vi.fn(),
	deleteProjectById: vi.fn(),
}));

// Mock the participant service for the same reason.
//
// This keeps the test focused on the controller behavior:
// - HTTP status codes
// - JSON responses
// - service method calls
//
// The participant update business logic is tested separately in service tests.
vi.mock("../../src/services/participants.service", () => ({
	updateProjectParticipants: vi.fn(),
}));

describe("projects.controller", () => {
	// Partial<Request> and Partial<Response> allow us to mock only
	// the properties used by the controller without recreating the
	// entire Express Request and Response objects.
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		// Reset all mocks before each test to avoid side effects
		// between test cases and ensure test isolation.
		vi.clearAllMocks();

		// Mock Express response methods.
		//
		// status() returns the response object itself in Express,
		// so mockReturnThis() reproduces method chaining:
		// res.status(200).json(...)
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
			send: vi.fn(),
		};
	});

	describe("getProjectByIdController", () => {
		it("should return a project with status 200", async () => {
			// ARRANGE
			const project = {
				id: 1,
				name: "Project Alpha",
			};

			req = {
				params: { id: "1" },
				userId: 42,
			};

			vi.mocked(getProjectById).mockResolvedValue(project as never);

			// ACT
			await getProjectByIdController(req as Request, res as Response);

			// ASSERT
			expect(getProjectById).toHaveBeenCalledWith(1, 42);

			expect(res.status).toHaveBeenCalledWith(200);

			expect(res.json).toHaveBeenCalledWith({
				project,
			});
		});
	});

	describe("updateProjectByIdController", () => {
		it("should update a project and return status 200", async () => {
			// ARRANGE
			const payload = {
				name: "Updated Project",
			};

			const projectUpdate = {
				id: 1,
				name: "Updated Project",
			};

			req = {
				params: { id: "1" },
				userId: 42,
				body: payload,
			};

			vi.mocked(updateProjectById).mockResolvedValue(projectUpdate as never);

			// ACT
			await updateProjectByIdController(req as Request, res as Response);

			// ASSERT
			expect(updateProjectById).toHaveBeenCalledWith(payload, 1, 42);

			expect(res.status).toHaveBeenCalledWith(200);

			expect(res.json).toHaveBeenCalledWith({
				projectUpdate,
			});
		});
	});

	describe("updateProjectParticipantsController", () => {
		it("should update participants and return status 200", async () => {
			// ARRANGE
			const participants = [
				{
					name: "Alice",
				},
			];

			const serviceResponse = {
				result: {
					message: "Participants updated",
				},
			};

			req = {
				params: { id: "1" },
				userId: 42,
				body: participants,
			};

			vi.mocked(updateProjectParticipants).mockResolvedValue(
				serviceResponse as never,
			);

			// ACT
			await updateProjectParticipantsController(
				req as Request,
				res as Response,
			);

			// ASSERT
			expect(updateProjectParticipants).toHaveBeenCalledWith(
				participants,
				1,
				42,
			);

			expect(res.status).toHaveBeenCalledWith(200);

			expect(res.json).toHaveBeenCalledWith(serviceResponse.result);
		});
	});

	describe("deleteProjectByIdController", () => {
		it("should delete a project and return status 204", async () => {
			// ARRANGE
			req = {
				params: { id: "1" },
				userId: 42,
			};

			vi.mocked(deleteProjectById).mockResolvedValue(undefined as never);

			// ACT
			await deleteProjectByIdController(req as Request, res as Response);

			// ASSERT
			expect(deleteProjectById).toHaveBeenCalledWith(1, 42);

			expect(res.status).toHaveBeenCalledWith(204);

			expect(res.send).toHaveBeenCalled();
		});
	});
});
