import { describe, expect, it } from "vitest";
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	HttpError,
	NotFoundError,
	TooManyRequestsError,
	UnauthorizedError,
} from "./errors";

describe("HttpError", () => {
	it("should create an HttpError with the provided message and status", () => {
		// ARRANGE
		const message = "Something went wrong";
		const status = 500;

		// ACT
		const error = new HttpError(message, { status });

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(status);
		expect(error.name).toBe("HttpError");
		expect(error).toBeInstanceOf(Error);
	});
});

describe("NotFoundError", () => {
	it("should create a 404 error", () => {
		// ARRANGE
		const message = "Resource not found";

		// ACT
		const error = new NotFoundError(message);

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(404);
		expect(error.name).toBe("NotFoundError");
		expect(error).toBeInstanceOf(HttpError);
		expect(error).toBeInstanceOf(Error);
	});
});

describe("BadRequestError", () => {
	it("should create a 400 error", () => {
		// ARRANGE
		const message = "Invalid request";

		// ACT
		const error = new BadRequestError(message);

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(400);
		expect(error.name).toBe("BadRequestError");
		expect(error).toBeInstanceOf(HttpError);
		expect(error).toBeInstanceOf(Error);
	});
});

describe("UnauthorizedError", () => {
	it("should create a 401 error", () => {
		// ARRANGE
		const message = "Unauthorized";

		// ACT
		const error = new UnauthorizedError(message);

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(401);
		expect(error.name).toBe("UnauthorizedError");
		expect(error).toBeInstanceOf(HttpError);
		expect(error).toBeInstanceOf(Error);
	});
});

describe("ForbiddenError", () => {
	it("should create a 403 error", () => {
		// ARRANGE
		const message = "Forbidden";

		// ACT
		const error = new ForbiddenError(message);

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(403);
		expect(error.name).toBe("ForbiddenError");
		expect(error).toBeInstanceOf(HttpError);
		expect(error).toBeInstanceOf(Error);
	});
});

describe("ConflictError", () => {
	it("should create a 409 error", () => {
		// ARRANGE
		const message = "Conflict";

		// ACT
		const error = new ConflictError(message);

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(409);
		expect(error.name).toBe("ConflictError");
		expect(error).toBeInstanceOf(HttpError);
		expect(error).toBeInstanceOf(Error);
	});
});

describe("TooManyRequestsError", () => {
	it("should create a 429 error", () => {
		// ARRANGE
		const message = "Too many requests";

		// ACT
		const error = new TooManyRequestsError(message);

		// ASSERT
		expect(error.message).toBe(message);
		expect(error.status).toBe(429);
		expect(error.name).toBe("TooManyRequestsError");
		expect(error).toBeInstanceOf(HttpError);
		expect(error).toBeInstanceOf(Error);
	});
});
