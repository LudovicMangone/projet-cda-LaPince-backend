import { describe, expect, it } from "vitest";

// ─── URL helpers ─────────────────────────────────────────────────────────────
// Use process.env.PORT set dynamically by integration-setup.ts after app.listen(0)
function getBaseUrl() {
	return `http://localhost:${process.env.PORT}/api`;
}
function getAuthUrl() {
	return `${getBaseUrl()}/auth`;
}
function getProjectsUrl() {
	return `${getBaseUrl()}/projects`;
}

// ─── Test helpers ─────────────────────────────────────────────────────────────

// Registers a user and returns a JWT token.
// Used in ARRANGE steps to authenticate requests.
async function registerAndLogin(
	email = "owner@lapince.fr",
	password = "Password123",
	name = "Owner",
): Promise<string> {
	await fetch(`${getAuthUrl()}/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});
	const res = await fetch(`${getAuthUrl()}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	const { token } = await res.json();
	return token as string;
}

// Creates a project via the API and returns its id.
// Used in ARRANGE steps to set up test data.
async function createProject(
	token: string,
	payload: Record<string, unknown> = { name: "Voyage à Rome", type: "Voyage" },
): Promise<number> {
	const res = await fetch(getProjectsUrl(), {
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

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
describe("[GET] /api/projects/:id", () => {
	it("should return the requested project for an authorized user (200)", async () => {
		// ARRANGE — register a user, create a project owned by them
		const token = await registerAndLogin("get-project@lapince.fr");
		const projectId = await createProject(token, {
			name: "Voyage à Rome",
			type: "Voyage",
			budget: { amount: 1500, alertEnabled: true, limitCriteria: 80 },
		});

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body.project.id).toBe(projectId);
		expect(body.project.name).toBe("Voyage à Rome");
		expect(body.project.type).toBe("Voyage");
		expect(body.project).toHaveProperty("budget");
		expect(body.project).toHaveProperty("projectParticipants");
	});

	it("should return 401 when no token is provided", async () => {
		// ARRANGE — create a project to have a valid id
		const token = await registerAndLogin("get-unauth@lapince.fr");
		const projectId = await createProject(token);

		// ACT — request without Authorization header
		const res = await fetch(`${getProjectsUrl()}/${projectId}`);

		// ASSERT
		expect(res.status).toBe(401);
	});

	it("should return 403 if the user is not the owner of the project", async () => {
		// ARRANGE — two different users
		const ownerToken = await registerAndLogin("get-owner@lapince.fr");
		const otherToken = await registerAndLogin(
			"get-other@lapince.fr",
			"Password123",
			"OtherUser",
		);
		const projectId = await createProject(ownerToken);

		// ACT — the other user tries to access the owner's project
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${otherToken}` },
		});

		// ASSERT
		expect(res.status).toBe(403);
	});

	it("should return 404 if the project does not exist", async () => {
		// ARRANGE — authenticated user with a non-existent project id
		const token = await registerAndLogin("get-404@lapince.fr");

		// ACT
		const res = await fetch(`${getProjectsUrl()}/999999`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		// ASSERT
		expect(res.status).toBe(404);
	});
});

// ─── PATCH /api/projects/:id ──────────────────────────────────────────────────
describe("[PATCH] /api/projects/:id", () => {
	it("should update the project name (200)", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-name@lapince.fr");
		const projectId = await createProject(token, {
			name: "Ancien nom",
			type: "Voyage",
		});

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: "Nouveau nom" }),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body.projectUpdate.project.name).toBe("Nouveau nom");
	});

	it("should update the project description (200)", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-desc@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ description: "Une nouvelle description" }),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body.projectUpdate.project.description).toBe(
			"Une nouvelle description",
		);
	});

	it("should update the project archived status (200)", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-archive@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ isArchived: true }),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body.projectUpdate.project.isArchived).toBe(true);
	});

	it("should add or update a budget (200)", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-budget@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				budget: { amount: 2000, limitCriteria: 75 },
			}),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body.projectUpdate.budget.amount).toBe(2000);
		expect(body.projectUpdate.budget.limitCriteria).toBe(75);
	});

	it("should delete the budget with deleteBudget flag (200)", async () => {
		// ARRANGE — create a project with a budget, then delete it
		const token = await registerAndLogin("patch-delete-budget@lapince.fr");
		const projectId = await createProject(token, {
			name: "Avec budget",
			type: "Voyage",
			budget: { amount: 500, alertEnabled: false, limitCriteria: 80 },
		});

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ deleteBudget: true }),
		});

		// ASSERT
		expect(res.status).toBe(200);

		// Verify budget is gone by fetching the project
		const getRes = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const getBody = await getRes.json();
		expect(getBody.project.budget).toBeNull();
	});

	it("should return 400 if no field is provided", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-empty@lapince.fr");
		const projectId = await createProject(token);

		// ACT — empty body, no field to update
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({}),
		});

		// ASSERT — schema refine requires at least one field
		expect(res.status).toBe(400);
	});

	it("should return 400 if data is invalid", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-invalid@lapince.fr");
		const projectId = await createProject(token);

		// ACT — name too short (min 2 chars)
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: "A" }),
		});

		// ASSERT
		expect(res.status).toBe(400);
	});

	it("should return 401 when no token is provided", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-unauth@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Nouveau nom" }),
		});

		// ASSERT
		expect(res.status).toBe(401);
	});

	it("should return 403 if the user does not own the project", async () => {
		// ARRANGE — two users, project owned by the first
		const ownerToken = await registerAndLogin("patch-owner@lapince.fr");
		const otherToken = await registerAndLogin(
			"patch-other@lapince.fr",
			"Password123",
			"OtherUser",
		);
		const projectId = await createProject(ownerToken);

		// ACT — second user tries to update the first user's project
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${otherToken}`,
			},
			body: JSON.stringify({ name: "Tentative de modification" }),
		});

		// ASSERT
		expect(res.status).toBe(403);
	});

	it("should return 404 if the project does not exist", async () => {
		// ARRANGE
		const token = await registerAndLogin("patch-404@lapince.fr");

		// ACT
		const res = await fetch(`${getProjectsUrl()}/999999`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: "Fantôme" }),
		});

		// ASSERT
		expect(res.status).toBe(404);
	});
});

// ─── PATCH /api/projects/:id/participants ─────────────────────────────────────
describe("[PATCH] /api/projects/:id/participants", () => {
	it("should add a new participant (200)", async () => {
		// ARRANGE — create a project with one participant
		const token = await registerAndLogin("part-add@lapince.fr");
		const projectId = await createProject(token, {
			name: "Projet participants",
			type: "Voyage",
			participants: [{ name: "Alice" }],
		});

		// ACT — send two participants (the existing one + a new one)
		// The service compares current ids with incoming ids to detect additions
		const existingRes = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const existingBody = await existingRes.json();
		const existingParticipants = existingBody.project.projectParticipants.map(
			(pp: { participant: { id: number; name: string } }) => pp.participant,
		);

		const res = await fetch(`${getProjectsUrl()}/${projectId}/participants`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify([
				...existingParticipants,
				{ name: "Bob", appUser: null }, // new participant, no id
			]),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body).toHaveLength(existingParticipants.length + 1);
		const names = body.map(
			(p: { participant: { name: string } }) => p.participant.name,
		);
		expect(names).toContain("Bob");
	});

	it("should update an existing participant name (200)", async () => {
		// ARRANGE
		const token = await registerAndLogin("part-update@lapince.fr");
		const projectId = await createProject(token, {
			name: "Projet update participant",
			type: "Voyage",
			participants: [{ name: "Charlie" }],
		});

		const existingRes = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const existingBody = await existingRes.json();
		const participant = existingBody.project.projectParticipants[0].participant;

		// ACT — send the same participant with a new name
		const res = await fetch(`${getProjectsUrl()}/${projectId}/participants`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify([{ id: participant.id, name: "Charlie Updated" }]),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		const updated = body.find(
			(p: { participantId: number }) => p.participantId === participant.id,
		);
		expect(updated.participant.name).toBe("Charlie Updated");
	});

	it("should remove a participant (200)", async () => {
		// ARRANGE — project with two participants
		const token = await registerAndLogin("part-remove@lapince.fr");
		const projectId = await createProject(token, {
			name: "Projet remove participant",
			type: "Voyage",
			participants: [{ name: "Dave" }, { name: "Eve" }],
		});

		const existingRes = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const existingBody = await existingRes.json();
		const participants = existingBody.project.projectParticipants.map(
			(pp: { participant: { id: number; name: string } }) => pp.participant,
		);

		// ACT — send only the first participant, omitting the second (Eve)
		// The service detects missing ids and deletes the corresponding participant
		const res = await fetch(`${getProjectsUrl()}/${projectId}/participants`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify([participants[0]]),
		});
		const body = await res.json();

		// ASSERT
		expect(res.status).toBe(200);
		expect(body).toHaveLength(1);
		expect(body[0].participant.name).toBe(participants[0].name);
	});

	it("should return 400 if data is invalid", async () => {
		// ARRANGE
		const token = await registerAndLogin("part-invalid@lapince.fr");
		const projectId = await createProject(token);

		// ACT — participant name too short (min 2 chars per schema)
		const res = await fetch(`${getProjectsUrl()}/${projectId}/participants`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify([{ name: "A" }]),
		});

		// ASSERT
		expect(res.status).toBe(400);
	});

	it("should return 401 when no token is provided", async () => {
		// ARRANGE
		const token = await registerAndLogin("part-unauth@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}/participants`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify([{ name: "Frank" }]),
		});

		// ASSERT
		expect(res.status).toBe(401);
	});

	it("should return 403 if the user is not the project owner", async () => {
		// ARRANGE
		const ownerToken = await registerAndLogin("part-owner@lapince.fr");
		const otherToken = await registerAndLogin(
			"part-other@lapince.fr",
			"Password123",
			"OtherUser",
		);
		const projectId = await createProject(ownerToken);

		// ACT — another user tries to modify participants
		const res = await fetch(`${getProjectsUrl()}/${projectId}/participants`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${otherToken}`,
			},
			body: JSON.stringify([{ name: "Intrus" }]),
		});

		// ASSERT
		expect(res.status).toBe(403);
	});

	it("should return 404 if the project does not exist", async () => {
		// ARRANGE
		const token = await registerAndLogin("part-404@lapince.fr");

		// ACT
		const res = await fetch(`${getProjectsUrl()}/999999/participants`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify([{ name: "Ghost" }]),
		});

		// ASSERT
		expect(res.status).toBe(404);
	});
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
describe("[DELETE] /api/projects/:id", () => {
	it("should delete an existing project and return 204", async () => {
		// ARRANGE
		const token = await registerAndLogin("delete-ok@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});

		// ASSERT
		expect(res.status).toBe(204);
	});

	it("should verify the project is no longer accessible after deletion", async () => {
		// ARRANGE
		const token = await registerAndLogin("delete-verify@lapince.fr");
		const projectId = await createProject(token);

		// ACT — delete then try to fetch it
		await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		// ASSERT — project is gone
		expect(res.status).toBe(404);
	});

	it("should return 401 when no token is provided", async () => {
		// ARRANGE
		const token = await registerAndLogin("delete-unauth@lapince.fr");
		const projectId = await createProject(token);

		// ACT
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "DELETE",
		});

		// ASSERT
		expect(res.status).toBe(401);
	});

	it("should return 403 if the user does not own the project", async () => {
		// ARRANGE
		const ownerToken = await registerAndLogin("delete-owner@lapince.fr");
		const otherToken = await registerAndLogin(
			"delete-other@lapince.fr",
			"Password123",
			"OtherUser",
		);
		const projectId = await createProject(ownerToken);

		// ACT — another user tries to delete the project
		const res = await fetch(`${getProjectsUrl()}/${projectId}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${otherToken}` },
		});

		// ASSERT
		expect(res.status).toBe(403);
	});

	it("should return 404 if the project does not exist", async () => {
		// ARRANGE
		const token = await registerAndLogin("delete-404@lapince.fr");

		// ACT
		const res = await fetch(`${getProjectsUrl()}/999999`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});

		// ASSERT
		expect(res.status).toBe(404);
	});
});
