import { describe, expect, it } from "vitest";
import "./config/global-setup";
import { prisma } from "../lib/prisma";

const BASE_URL = "http://localhost:3001/api";
const AUTH_URL = `${BASE_URL}/auth`;
const PROJECTS_URL = `${BASE_URL}/projects`;

type CreatedProject = {
	id: number;
	projectParticipants: {
		participant: {
			id: number;
			name: string;
		};
	}[];
};

// ─── Helpers ─────────────────────────────────────────────────
async function registerAndLogin(
	email = "operations@lapince.fr",
	password = "Password123",
	name = "OperationsUser",
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

async function createCategory(): Promise<number> {
	const category = await prisma.category.create({
		data: {
			name: "Restaurant",
			color: "#12AB34",
		},
	});

	return category.id;
}

async function createProject(token: string): Promise<CreatedProject> {
	const res = await fetch(PROJECTS_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			name: "Voyage à Rome",
			type: "Voyage",
			participants: [{ name: "Alice", isMe: true }, { name: "Bob" }],
		}),
	});
	const body = await res.json();
	return body.project as CreatedProject;
}

function createOperationPayload(
	project: CreatedProject,
	categoryId: number,
	overrides: Record<string, unknown> = {},
) {
	const [payer, participant] = project.projectParticipants.map(
		(projectParticipant) => projectParticipant.participant,
	);

	return {
		projectId: project.id,
		name: "Restaurant",
		amount: 100,
		date: "2026-06-11",
		categoryId,
		payerParticipantId: payer.id,
		isAmountCalculated: false,
		operationParticipants: [
			{
				participantId: payer.id,
				repartitionAmount: 50,
				isRepartitionAmountCalculated: false,
			},
			{
				participantId: participant.id,
				repartitionAmount: 50,
				isRepartitionAmountCalculated: false,
			},
		],
		...overrides,
	};
}

async function createOperation(
	token: string,
	project: CreatedProject,
	categoryId: number,
) {
	const res = await fetch(`${PROJECTS_URL}/${project.id}/operations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(createOperationPayload(project, categoryId)),
	});
	const body = await res.json();
	return body.operations as { id: number; name: string; amount: string };
}

// ─── GET /api/projects/:id/operations ─────────────────────────
describe("[GET] /api/projects/:id/operations", () => {
	it("should return 401 when no token provided", async () => {
		const res = await fetch(`${PROJECTS_URL}/1/operations`);

		expect(res.status).toBe(401);
	});

	it("should return 200 and empty list when project has no operations", async () => {
		const token = await registerAndLogin("operations-empty@lapince.fr");
		const project = await createProject(token);

		const res = await fetch(`${PROJECTS_URL}/${project.id}/operations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.operations).toEqual([]);
	});

	it("should return 403 when user is not the project owner", async () => {
		const ownerToken = await registerAndLogin("operations-owner@lapince.fr");
		const otherToken = await registerAndLogin("operations-other@lapince.fr");
		const project = await createProject(ownerToken);

		const res = await fetch(`${PROJECTS_URL}/${project.id}/operations`, {
			headers: { Authorization: `Bearer ${otherToken}` },
		});

		expect(res.status).toBe(403);
	});
});

// ─── POST /api/projects/:id/operations ────────────────────────
describe("[POST] /api/projects/:id/operations", () => {
	it("should create an operation and return it", async () => {
		const token = await registerAndLogin("operations-create@lapince.fr");
		const categoryId = await createCategory();
		const project = await createProject(token);

		const res = await fetch(`${PROJECTS_URL}/${project.id}/operations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(createOperationPayload(project, categoryId)),
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.operations.id).toEqual(expect.any(Number));
		expect(body.operations.name).toBe("Restaurant");
		expect(Number(body.operations.amount)).toBe(100);
	});

	it("should return 422 when payload is invalid", async () => {
		const token = await registerAndLogin("operations-invalid@lapince.fr");
		const project = await createProject(token);

		const res = await fetch(`${PROJECTS_URL}/${project.id}/operations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				projectId: project.id,
				name: "",
				amount: -10,
			}),
		});

		expect(res.status).toBe(422);
	});
});

// ─── PATCH /api/projects/:id/operations/:operationId ──────────
describe("[PATCH] /api/projects/:id/operations/:operationId", () => {
	it("should update an operation and return it", async () => {
		const token = await registerAndLogin("operations-update@lapince.fr");
		const categoryId = await createCategory();
		const project = await createProject(token);
		const operation = await createOperation(token, project, categoryId);

		const res = await fetch(
			`${PROJECTS_URL}/${project.id}/operations/${operation.id}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(
					createOperationPayload(project, categoryId, {
						name: "Courses",
						amount: 80,
					}),
				),
			},
		);
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.operations.id).toBe(operation.id);
		expect(body.operations.name).toBe("Courses");
		expect(Number(body.operations.amount)).toBe(80);
	});
});

// ─── DELETE /api/projects/:id/operations/:operationId ─────────
describe("[DELETE] /api/projects/:id/operations/:operationId", () => {
	it("should delete an operation", async () => {
		const token = await registerAndLogin("operations-delete@lapince.fr");
		const categoryId = await createCategory();
		const project = await createProject(token);
		const operation = await createOperation(token, project, categoryId);

		const res = await fetch(
			`${PROJECTS_URL}/${project.id}/operations/${operation.id}`,
			{
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		const listRes = await fetch(`${PROJECTS_URL}/${project.id}/operations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = await listRes.json();

		expect(res.status).toBe(204);
		expect(body.operations).toEqual([]);
	});
});
