import type { CookieOptions } from "express";

export const REFRESH_COOKIE_NAME = "refreshToken";

// Le cookie de session, verrouillé au maximum :
// - httpOnly : invisible pour le JavaScript de la page → un XSS ne peut pas le LIRE
//   (c'est la différence fondamentale avec l'ancien localStorage)
// - secure   : ne circule qu'en HTTPS — désactivé en dev local (HTTP)
// - sameSite : "none" en prod car le front (vercel.app) et l'API (onrender.com)
//   sont deux SITES différents — sans "none", le navigateur ne joindrait jamais
//   le cookie en cross-site. En dev (localhost des deux côtés), "lax" plus strict.
//   NB : "none" exige secure=true, les deux vont donc toujours ensemble.
// - path     : le cookie n'est envoyé QU'AUX routes /api/auth — les routes métier
//   ne le voient jamais (surface d'exposition minimale, et un octet de moins
//   par requête sur tout le reste de l'API)
export function refreshCookieOptions(expiresAt: Date): CookieOptions {
	const isProd = process.env.NODE_ENV === "production";
	return {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? "none" : "lax",
		path: "/api/auth",
		expires: expiresAt,
	};
}
