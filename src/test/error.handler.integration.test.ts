import { describe, expect, it } from "vitest";

function getBaseUrl() {
	return `http://localhost:${process.env.PORT}`;
}

describe("Global error handling", () => {
	describe("404 errors", () => {
		it("should return 404 for an unknown route", async () => {
			// ACT
			const response = await fetch(`${getBaseUrl()}/this-route-does-not-exist`);
			const body = await response.json();

			// ASSERT
			expect(response.status).toBe(404);
			expect(body).toEqual({
				status: 404,
				error: "404 - Resource not found",
			});
		});
	});

	describe("401 authentication errors", () => {
		it("should return 401 when no token is provided", async () => {
			// ACT
			const response = await fetch(`${getBaseUrl()}/api/projects`);
			const body = await response.json();

			// ASSERT
			expect(response.status).toBe(401);
			expect(body).toEqual({
				status: 401,
				error: "Token manquant ou invalide",
			});
		});
		it("should return 401 when token is invalid", async () => {
			// ARRANGE
			const invalidToken = "invalid-token";

			// ACT
			const response = await fetch(`${getBaseUrl()}/api/projects`, {
				headers: {
					Authorization: `Bearer ${invalidToken}`,
				},
			});
			const body = await response.json();

			// ASSERT
			expect(response.status).toBe(401);
			expect(body).toEqual({
				status: 401,
				error: "Token expiré ou invalide",
			});
		});
	});

	describe("500 unexpected errors", () => {
		it("should return 500 for an unhandled error", async () => {
			// ACT
			const response = await fetch(`${getBaseUrl()}/test/error`);
			const body = await response.json();

			// ASSERT
			expect(response.status).toBe(500);
			expect(body).toHaveProperty("status", 500);
			expect(body).toHaveProperty("error", "Internal server error");
		});
	});
});
