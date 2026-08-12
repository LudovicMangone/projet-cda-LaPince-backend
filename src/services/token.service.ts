import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config";
import { UnauthorizedError } from "../lib/errors";
import { prisma } from "../lib/prisma";

// ─── Durées de vie ───────────────────────────────────────────
// Access token COURT : c'est lui qui circule sur chaque requête (header Authorization).
// S'il est volé (XSS...), il expire en 15 minutes — la fenêtre d'attaque est bornée.
export const ACCESS_TOKEN_TTL = "15m";
// Refresh token LONG : il ne circule que vers /api/auth (cookie HttpOnly à path restreint)
// et il est révocable en base — c'est lui qui porte la session de 7 jours.
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// JWT signé courte durée — validé par signature uniquement, AUCUNE requête en base.
// C'est le côté "stateless" du duo : rapide, mais non révocable, donc court.
export function signAccessToken(userId: number): string {
	return jwt.sign({ userId }, envConfig.jwtSecret, {
		expiresIn: ACCESS_TOKEN_TTL,
	});
}

// SHA-256 (et pas argon2) : argon2 est volontairement LENT pour compenser la faible
// entropie des mots de passe humains. Ici le token contient 384 bits d'aléa
// cryptographique — impossible à brute-forcer — donc un hash rapide suffit.
function hashToken(rawToken: string): string {
	return createHash("sha256").update(rawToken).digest("hex");
}

// Ouvre une session : token opaque aléatoire, stocké HACHÉ (jamais en clair —
// si la base fuite, les empreintes SHA-256 sont inexploitables).
// Le token en clair n'existe qu'une fois, le temps de poser le cookie.
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

// Rotation : chaque appel à /refresh CONSOMME le token présenté et en émet un
// nouveau. Un token volé ne sert donc qu'une seule fois — et si le voleur l'a
// déjà consommé, l'utilisateur légitime reçoit un 401 (signal de compromission).
export async function rotateRefreshToken(rawToken: string) {
	const stored = await prisma.refreshToken.findUnique({
		where: { tokenHash: hashToken(rawToken) },
	});

	if (!stored) {
		throw new UnauthorizedError("Session invalide ou expirée");
	}

	if (stored.expiresAt < new Date()) {
		// Session périmée : on nettoie la ligne morte au passage
		await prisma.refreshToken.delete({ where: { id: stored.id } });
		throw new UnauthorizedError("Session invalide ou expirée");
	}

	// delete + create dans UNE transaction : l'ancien token ne doit jamais rester
	// valide en même temps que le nouveau (la rotation est atomique)
	const newRawToken = randomBytes(48).toString("base64url");
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

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

// Révocation au logout : la ligne meurt en base → la session n'existe plus
// côté serveur. deleteMany est idempotent : déconnecter une session déjà
// morte n'est pas une erreur (l'utilisateur est déconnecté, c'est le but).
export async function revokeRefreshToken(rawToken: string): Promise<void> {
	await prisma.refreshToken.deleteMany({
		where: { tokenHash: hashToken(rawToken) },
	});
}
