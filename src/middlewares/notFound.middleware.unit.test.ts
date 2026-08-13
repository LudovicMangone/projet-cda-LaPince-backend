import { describe, expect, it } from "vitest";
import { NotFoundError } from "../lib/errors";
import { notFoundHandler } from "./notFound.middleware";

describe("notFoundHandler", () => {
	it("should throw a NotFoundError with a 404 status", () => {
		// ARRANGE

		// ACT & ASSERT
		expect(() => notFoundHandler()).toThrow(NotFoundError);
	});

	it("should throw a NotFoundError with the correct message", () => {
		// ARRANGE

		// ACT
		const action = () => notFoundHandler();

		// ASSERT
		expect(action).toThrow("404 - Resource not found");
	});

	it("should throw a NotFoundError with status 404", () => {
		// ARRANGE

		// ACT
		try {
			notFoundHandler();
		} catch (error) {
			// ASSERT
			expect(error).toBeInstanceOf(NotFoundError);
			expect((error as NotFoundError).status).toBe(404);
		}
	});
});
