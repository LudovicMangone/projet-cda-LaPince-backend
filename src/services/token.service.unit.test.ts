import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import {
	createRefreshToken,
	revokeRefreshToken,
	rotateRefreshToken,
	signAccessToken,
} from "./token.service";

// ─── Mocks ───────────────────────────────────────────────────
// Prisma est mocké : les tests unitaires valident la LOGIQUE (hachage, rotation,
// expiration), jamais la base — c'est le rôle des tests d'intégration.
vi.mock("../lib/prisma", () => ({
	prisma: {
		refreshToken: {
			create: vi.fn(),
			findUnique: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
		},
		// Forme tableau de $transaction : reçoit les opérations déjà lancées
		$transaction: vi.fn(async (ops) => ops),
	},
}));

vi.mock("jsonwebtoken", () => ({
	default: {
		sign: vi.fn().mockReturnValue("mocked_access_token"),
	},
}));

beforeEach(() => {
	vi.clearAllMocks();
});

// ─── signAccessToken ─────────────────────────────────────────
describe("[signAccessToken]", () => {
	it("should sign a 15-minute JWT carrying the userId", () => {
		// ACT
		const token = signAccessToken(42);

		// ASSERT
		expect(token).toBe("mocked_access_token");
		expect(jwt.sign).toHaveBeenCalledWith({ userId: 42 }, expect.any(String), {
			expiresIn: "15m",
		});
	});
});

// ─── createRefreshToken ──────────────────────────────────────
describe("[createRefreshToken]", () => {
	it("should store a sha256 hash, never the raw token", async () => {
		// ACT
		const { rawToken, expiresAt } = await createRefreshToken(1);

		// ASSERT — le token en clair est long et aléatoire
		expect(rawToken.length).toBeGreaterThanOrEqual(64);
		const saved = vi.mocked(prisma.refreshToken.create).mock.calls[0][0];
		// Ce qui part en base est une empreinte hex de 64 caractères...
		expect(saved.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
		// ...et surtout PAS le token lui-même
		expect(saved.data.tokenHash).not.toBe(rawToken);
		expect(saved.data.appUserId).toBe(1);
		// Expiration ~7 jours (tolérance 5 s)
		const sevenDays = 7 * 24 * 60 * 60 * 1000;
		expect(expiresAt.getTime() - Date.now()).toBeGreaterThan(sevenDays - 5000);
	});

	it("should generate a different token every call", async () => {
		// ACT
		const first = await createRefreshToken(1);
		const second = await createRefreshToken(1);

		// ASSERT
		expect(first.rawToken).not.toBe(second.rawToken);
	});
});

// ─── rotateRefreshToken ──────────────────────────────────────
describe("[rotateRefreshToken]", () => {
	it("should throw UnauthorizedError when the token is unknown", async () => {
		// ARRANGE
		vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);

		// ACT & ASSERT
		await expect(rotateRefreshToken("unknown-token")).rejects.toThrow(
			UnauthorizedError,
		);
	});

	it("should delete and reject an expired token", async () => {
		// ARRANGE — session périmée depuis 1 minute
		vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
			id: 7,
			tokenHash: "hash",
			appUserId: 1,
			expiresAt: new Date(Date.now() - 60_000),
			createdAt: new Date(),
		});

		// ACT & ASSERT
		await expect(rotateRefreshToken("expired-token")).rejects.toThrow(
			UnauthorizedError,
		);
		// La ligne morte est nettoyée au passage
		expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
			where: { id: 7 },
		});
	});

	it("should rotate atomically: consume the old row, issue a new pair", async () => {
		// ARRANGE — session valide encore 1 h
		vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
			id: 7,
			tokenHash: "hash",
			appUserId: 42,
			expiresAt: new Date(Date.now() + 3_600_000),
			createdAt: new Date(),
		});

		// ACT
		const rotated = await rotateRefreshToken("valid-token");

		// ASSERT — nouveau couple access + refresh
		expect(rotated.accessToken).toBe("mocked_access_token");
		expect(rotated.rawToken).not.toBe("valid-token");
		expect(jwt.sign).toHaveBeenCalledWith({ userId: 42 }, expect.any(String), {
			expiresIn: "15m",
		});
		// L'ancien est consommé et le nouveau créé dans UNE transaction
		expect(prisma.$transaction).toHaveBeenCalledOnce();
		expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
			where: { id: 7 },
		});
		expect(prisma.refreshToken.create).toHaveBeenCalledOnce();
	});
});

// ─── revokeRefreshToken ──────────────────────────────────────
describe("[revokeRefreshToken]", () => {
	it("should delete the session row matching the hashed token", async () => {
		// ACT
		await revokeRefreshToken("some-token");

		// ASSERT — la suppression cible bien l'empreinte, pas le token en clair
		const call = vi.mocked(prisma.refreshToken.deleteMany).mock.calls[0][0];
		expect(call.where.tokenHash).toMatch(/^[a-f0-9]{64}$/);
	});
});
