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

// Pose le cookie de session : appelé à chaque fois qu'un refresh token est émis
// (register, login, rotation). Le token en clair ne transite QUE par ce cookie,
// jamais par le corps JSON — le JavaScript du front ne le voit jamais.
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

	// Ouvre la session longue durée dès l'inscription (connexion automatique)
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

// Échange le refresh token (cookie) contre un nouvel access token.
// Appelé par le front quand l'access token expire (toutes les ~15 min)
// et au chargement de l'application pour restaurer la session.
export async function refresh(req: Request, res: Response) {
	// Le cookie est joint automatiquement par le navigateur (credentials: "include") ;
	// s'il est absent, il n'y a simplement pas de session à restaurer
	const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
	if (!rawToken) {
		throw new UnauthorizedError("Aucune session active");
	}

	// Rotation : le token présenté est consommé, un nouveau couple est émis
	const rotated = await rotateRefreshToken(rawToken);
	setRefreshCookie(res, rotated);

	res.status(200).json({ token: rotated.accessToken });
}

export async function logout(req: Request, res: Response) {
	// Déconnexion RÉELLE : la session est supprimée en base — le cookie volé
	// éventuel devient inutilisable (impossible avec le JWT seul d'avant)
	const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
	if (rawToken) {
		await revokeRefreshToken(rawToken);
	}

	// clearCookie doit reprendre les mêmes attributs (path, sameSite, secure)
	// sinon le navigateur considère que c'est un AUTRE cookie et garde l'ancien.
	// Express 5 ignore expires/maxAge ici et pose lui-même une date passée.
	res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions(new Date()));

	res.status(200).json({ message: "Déconnexion réussie" });
}

export async function me(req: Request, res: Response) {
	const user = await getMe(req.userId);
	res.status(200).json({ user });
}
