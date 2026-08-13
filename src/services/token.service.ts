import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";
import { UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";

// Access token: short-lived, sent on every request, validated by signature only.
export const ACCESS_TOKEN_TTL = "15m";
// Refresh token: long-lived, HttpOnly cookie scoped to /api/auth, revocable in DB.
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function signAccessToken(userId: number): string {
	return jwt.sign({ userId }, envConfig.jwtSecret, {
		expiresIn: ACCESS_TOKEN_TTL,
	});
}

// SHA-256, not argon2: the raw token carries 384 bits of CSPRNG entropy (not
// guessable), and the DB lookup requires a deterministic hash. Slow, salted
// hashing only makes sense for low-entropy secrets such as passwords.
function hashToken(rawToken: string): string {
	return createHash("sha256").update(rawToken).digest("hex");
}

// Opens a session. The raw token is returned once (for the cookie);
// only its hash is ever stored.
export async function createRefreshToken(userId: number) {
	const rawToken = randomBytes(48).toString("base64url");
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

	await prisma.refreshToken.create({
		data: {
			tokenHash: hashToken(rawToken),
			appUserId: userId,
			expiresAt,
		},
	});

	return { rawToken, expiresAt };
}

// Rotation: each refresh CONSUMES the presented token and issues a new pair,
// so a stolen refresh token can only ever be used once.
export async function rotateRefreshToken(rawToken: string) {
	const stored = await prisma.refreshToken.findUnique({
		where: { tokenHash: hashToken(rawToken) },
	});

	if (!stored) {
		throw new UnauthorizedError("Session invalide ou expirée");
	}

	if (stored.expiresAt < new Date()) {
		// Expired session: clean up the dead row on the way out
		await prisma.refreshToken.delete({ where: { id: stored.id } });
		throw new UnauthorizedError("Session invalide ou expirée");
	}

	const newRawToken = randomBytes(48).toString("base64url");
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

	// Atomic swap: the old token must never remain valid alongside the new one
	await prisma.$transaction([
		prisma.refreshToken.delete({ where: { id: stored.id } }),
		prisma.refreshToken.create({
			data: {
				tokenHash: hashToken(newRawToken),
				appUserId: stored.appUserId,
				expiresAt,
			},
		}),
	]);

	return {
		accessToken: signAccessToken(stored.appUserId),
		rawToken: newRawToken,
		expiresAt,
	};
}

// Logout: deleting the row kills the session server-side.
// deleteMany is idempotent — revoking an already-dead session is not an error.
export async function revokeRefreshToken(rawToken: string): Promise<void> {
	await prisma.refreshToken.deleteMany({
		where: { tokenHash: hashToken(rawToken) },
	});
}
