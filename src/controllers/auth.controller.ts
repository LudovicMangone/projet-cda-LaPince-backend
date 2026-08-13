import type { Request, Response } from "express";
import {
	REFRESH_COOKIE_NAME,
	refreshCookieOptions,
} from "../config/cookie.config";
import { UnauthorizedError } from "../lib/errors";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { getMe, loginUser, registerUser } from "../services/auth.service";
import {
	createRefreshToken,
	revokeRefreshToken,
	rotateRefreshToken,
} from "../services/token.service";

// The raw refresh token only ever travels through this cookie — never in JSON.
function setRefreshCookie(
	res: Response,
	session: { rawToken: string; expiresAt: Date },
) {
	res.cookie(
		REFRESH_COOKIE_NAME,
		session.rawToken,
		refreshCookieOptions(session.expiresAt),
	);
}

export async function register(req: Request, res: Response) {
	const data = await registerSchema.parseAsync(req.body);
	const { user, token } = await registerUser(data);

	// Open the long-lived session right away (auto-login after signup)
	const session = await createRefreshToken(user.id);
	setRefreshCookie(res, session);

	// Password is already stripped in the service — safe to send directly
	res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response) {
	const data = await loginSchema.parseAsync(req.body);
	const { user, token } = await loginUser(data);

	const session = await createRefreshToken(user.id);
	setRefreshCookie(res, session);

	res.status(200).json({ user, token });
}

// Exchanges the session cookie for a fresh access token (called by the front
// on 401 responses and on app load to restore the session).
export async function refresh(req: Request, res: Response) {
	const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
	if (!rawToken) {
		throw new UnauthorizedError("Aucune session active");
	}

	const rotated = await rotateRefreshToken(rawToken);
	setRefreshCookie(res, rotated);

	res.status(200).json({ token: rotated.accessToken });
}

export async function logout(req: Request, res: Response) {
	// Server-side revocation: the session dies in DB even if the cookie was stolen
	const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
	if (rawToken) {
		await revokeRefreshToken(rawToken);
	}

	// clearCookie must repeat the cookie attributes (path, sameSite, secure),
	// otherwise the browser treats it as a different cookie and keeps the old one
	res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions(new Date()));

	res.status(200).json({ message: "Déconnexion réussie" });
}

export async function me(req: Request, res: Response) {
	const user = await getMe(req.userId);
	res.status(200).json({ user });
}
