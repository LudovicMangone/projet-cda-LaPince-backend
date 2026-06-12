import { describe, expect, it } from "vitest";

function getBaseUrl() {
	return `http://localhost:${process.env.PORT}/api/auth`;
}

// ─── Register ────────────────────────────────────────────────
describe("[POST] /api/auth/register", () => {
	it("should create and return a new user (201)", async () => {
		// ARRANGE
		const newUser = {
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "Password123",
		};

		// ACT
		const response = await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newUser),
		});
		const body = await response.json();

		// ASSERT
		expect(response.status).toBe(201);
		expect(body.user.name).toBe("Ludo");
		expect(body.user.email).toBe("ludo@lapince.fr");
		expect(body.user.password).toBeUndefined();
	});

	it("should return 409 if email already exists", async () => {
		// ARRANGE
		const newUser = {
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "Password123",
		};
		await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newUser),
		});

		// ACT
		const response = await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newUser),
		});

		// ASSERT
		expect(response.status).toBe(409);
	});

	it("should return 422 if data is invalid", async () => {
		// ACT
		const response = await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "L",
				email: "notanemail",
				password: "weak",
			}),
		});

		// ASSERT
		expect(response.status).toBe(422);
	});
});

// ─── Login ───────────────────────────────────────────────────
describe("[POST] /api/auth/login", () => {
	it("should return user and token on valid credentials (200)", async () => {
		// ARRANGE
		await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Ludo",
				email: "ludo@lapince.fr",
				password: "Password123",
			}),
		});

		// ACT
		const response = await fetch(`${getBaseUrl()}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "ludo@lapince.fr",
				password: "Password123",
			}),
		});
		const body = await response.json();

		// ASSERT
		expect(response.status).toBe(200);
		expect(body).toHaveProperty("token");
		expect(body.user.password).toBeUndefined();
	});

	it("should return 401 if password is wrong", async () => {
		// ARRANGE
		await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Ludo",
				email: "ludo@lapince.fr",
				password: "Password123",
			}),
		});

		// ACT
		const response = await fetch(`${getBaseUrl()}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "ludo@lapince.fr",
				password: "WrongPassword1",
			}),
		});

		// ASSERT
		expect(response.status).toBe(401);
	});

	it("should return 401 if email does not exist", async () => {
		// ACT
		const response = await fetch(`${getBaseUrl()}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "unknown@lapince.fr",
				password: "Password123",
			}),
		});

		// ASSERT
		expect(response.status).toBe(401);
	});
});

// ─── Logout ──────────────────────────────────────────────────
describe("[POST] /api/auth/logout", () => {
	it("should return 200", async () => {
		// ACT
		const response = await fetch(`${getBaseUrl()}/logout`, { method: "POST" });

		// ASSERT
		expect(response.status).toBe(200);
	});
});

// ─── Me ──────────────────────────────────────────────────────
describe("[GET] /api/auth/me", () => {
	it("should return authenticated user (200)", async () => {
		// ARRANGE
		await fetch(`${getBaseUrl()}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Ludo",
				email: "ludo@lapince.fr",
				password: "Password123",
			}),
		});
		const loginResponse = await fetch(`${getBaseUrl()}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "ludo@lapince.fr",
				password: "Password123",
			}),
		});
		const { token } = await loginResponse.json();

		// ACT
		const response = await fetch(`${getBaseUrl()}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = await response.json();

		// ASSERT
		expect(response.status).toBe(200);
		expect(body.user.email).toBe("ludo@lapince.fr");
		expect(body.user.password).toBeUndefined();
	});

	it("should return 401 if no token", async () => {
		// ACT
		const response = await fetch(`${getBaseUrl()}/me`);

		// ASSERT
		expect(response.status).toBe(401);
	});
});
