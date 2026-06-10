import { describe, expect, it } from "vitest";
import "./config/global-setup";

const BASE_URL = "http://localhost:3001/api";
const AUTH_URL = `${BASE_URL}/auth`;
const PROJECTS_URL = `${BASE_URL}/projects`;

// ─── Helpers ─────────────────────────────────────────────────
async function registerAndLogin(
	email = "test@lapince.fr",
	password = "Password123",
	name = "TestUser",
): Promise<string> {
	await fetch(`${AUTH_URL}/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});
	const res = await fetch(`${AUTH_URL}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	const { token } = await res.json();
	return token as string;
}

async function createProject(
	token: string,
	payload: Record<string, unknown> = { name: "Voyage à Rome", type: "Voyage" },
): Promise<number> {
	const res = await fetch(PROJECTS_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});
	const body = await res.json();
	return body.project.id as number;
}

// ─── GET /api/projects ────────────────────────────────────────
describe("[GET] /api/projects", () => {
	it("should return 401 when no token provided", async () => {
		const res = await fetch(PROJECTS_URL);
		expect(res.status).toBe(401);
	});

	it("should return 200 and empty list when no projects (200)", async () => {
		const token = await registerAndLogin("get-list@lapince.fr");

		const res = await fetch(PROJECTS_URL, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.projects).toBeInstanceOf(Array);
		expect(body.total).toBe(0);
		expect(body.hasMore).toBe(false);
	});

	it("should return projects with pagination metadata (200)", async () => {
		const token = await registerAndLogin("get-paginated@lapince.fr");
		await createProject(token, { name: "Projet 1", type: "Voyage" });
		await createProject(token, { name: "Projet 2", type: "Anniversaire" });

		const res = await fetch(PROJECTS_URL, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.projects).toHaveLength(2);
		expect(body.total).toBe(2);
		expect(body).toHaveProperty("nextCursor");
		expect(body).toHaveProperty("hasMore");
	});
});

