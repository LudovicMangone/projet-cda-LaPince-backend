import type { CookieOptions } from "express";

export const REFRESH_COOKIE_NAME = "refreshToken";

// Session cookie, locked down:
// - httpOnly: invisible to page JavaScript — an XSS cannot read it
// - secure + sameSite "none" in prod: front (vercel.app) and API (onrender.com)
//   are two different sites; "none" is required for the browser to send the
//   cookie cross-site, and "none" requires secure. Stricter "lax" in local dev.
// - path: the cookie only travels to /api/auth routes (least exposure)
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
