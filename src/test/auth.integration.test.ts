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

// ─── Refresh token (session par cookie HttpOnly) ─────────────
// Ces tests passent par de vraies requêtes HTTP contre le vrai serveur et la
// vraie base : on vérifie le COMPORTEMENT complet (cookie posé, rotation,
// révocation), pas la logique interne — elle est couverte en unitaire.

// Le navigateur gère le cookie tout seul ; ici on le fait à la main :
// on extrait la valeur de l'en-tête Set-Cookie pour la renvoyer nous-mêmes.
function extractRefreshCookie(response: Response): string | null {
	const setCookie = response.headers.getSetCookie();
	const cookie = setCookie.find((c) => c.startsWith("refreshToken="));
	return cookie ? cookie.split(";")[0].split("=")[1] : null;
}

async function registerAndLogin(): Promise<Response> {
	await fetch(`${getBaseUrl()}/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: "Ludo",
			email: "ludo@lapince.fr",
			password: "Password123",
		}),
	});
	return fetch(`${getBaseUrl()}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: "ludo@lapince.fr",
			password: "Password123",
		}),
	});
}

describe("[POST] /api/auth/login — session cookie", () => {
	it("should set a hardened HttpOnly refresh cookie", async () => {
		// ACT
		const response = await registerAndLogin();

		// ASSERT — le cookie existe et porte les bons attributs de sécurité
		const setCookie = response.headers
			.getSetCookie()
			.find((c) => c.startsWith("refreshToken="));
		expect(setCookie).toBeDefined();
		expect(setCookie).toContain("HttpOnly");
		expect(setCookie).toContain("Path=/api/auth");
	});
});

describe("[POST] /api/auth/refresh", () => {
	it("should return 401 when no cookie is sent", async () => {
		// ACT
		const response = await fetch(`${getBaseUrl()}/refresh`, {
			method: "POST",
		});

		// ASSERT
		expect(response.status).toBe(401);
	});

	it("should issue a new access token and rotate the cookie", async () => {
		// ARRANGE
		const loginResponse = await registerAndLogin();
		const refreshCookie = extractRefreshCookie(loginResponse);

		// ACT
		const response = await fetch(`${getBaseUrl()}/refresh`, {
			method: "POST",
			headers: { Cookie: `refreshToken=${refreshCookie}` },
		});
		const body = await response.json();

		// ASSERT — nouvel access token + cookie DIFFÉRENT (rotation)
		expect(response.status).toBe(200);
		expect(body).toHaveProperty("token");
		const rotatedCookie = extractRefreshCookie(response);
		expect(rotatedCookie).toBeDefined();
		expect(rotatedCookie).not.toBe(refreshCookie);
	});

	it("should reject a consumed (rotated-out) token — single use", async () => {
		// ARRANGE — login puis refresh : le cookie du login est consommé
		const loginResponse = await registerAndLogin();
		const firstCookie = extractRefreshCookie(loginResponse);
		await fetch(`${getBaseUrl()}/refresh`, {
			method: "POST",
			headers: { Cookie: `refreshToken=${firstCookie}` },
		});

		// ACT — rejouer le PREMIER cookie (scénario du token volé puis réutilisé)
		const response = await fetch(`${getBaseUrl()}/refresh`, {
			method: "POST",
			headers: { Cookie: `refreshToken=${firstCookie}` },
		});

		// ASSERT
		expect(response.status).toBe(401);
	});
});

describe("[POST] /api/auth/logout — server-side revocation", () => {
	it("should revoke the session: refresh no longer works after logout", async () => {
		// ARRANGE
		const loginResponse = await registerAndLogin();
		const refreshCookie = extractRefreshCookie(loginResponse);

		// ACT — logout AVEC le cookie : la ligne de session est supprimée en base
		const logoutResponse = await fetch(`${getBaseUrl()}/logout`, {
			method: "POST",
			headers: { Cookie: `refreshToken=${refreshCookie}` },
		});

		// ASSERT — le même cookie ne permet plus de rafraîchir : session morte
		expect(logoutResponse.status).toBe(200);
		const refreshResponse = await fetch(`${getBaseUrl()}/refresh`, {
			method: "POST",
			headers: { Cookie: `refreshToken=${refreshCookie}` },
		});
		expect(refreshResponse.status).toBe(401);
	});

	it("should clear the cookie on the client too", async () => {
		// ARRANGE
		const loginResponse = await registerAndLogin();
		const refreshCookie = extractRefreshCookie(loginResponse);

		// ACT
		const response = await fetch(`${getBaseUrl()}/logout`, {
			method: "POST",
			headers: { Cookie: `refreshToken=${refreshCookie}` },
		});

		// ASSERT — le Set-Cookie de réponse vide la valeur (expiration passée)
		const cleared = response.headers
			.getSetCookie()
			.find((c) => c.startsWith("refreshToken="));
		expect(cleared).toBeDefined();
		expect(extractRefreshCookie(response)).toBeFalsy();
	});
});
