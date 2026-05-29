// For some critical variantes, we use errors to prevent problems
function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environnnement variable : ${name}`);
	}
	return value;
}

export const envConfig = {
	port: parseInt(process.env.PORT || "3000", 10),
	databaseUrl: requireEnv("DATABASE_URL"),
	// JWT_SECRET is validated at startup — not at runtime.
  // Without this, the server would start silently even if JWT_SECRET is missing,
  // and only crash on the first login attempt.
  // "Fail fast" principle : better to crash at boot with a clear message
  // than to fail unexpectedly in production.
	jwtSecret: requireEnv("JWT_SECRET"),
	// Setups for protections against attacs
	jsonLimit: process.env.NODE_ENV === "production" ? "100kb" : "1mb",
	rateLimitMax: process.env.NODE_ENV === "production" ? 100 : 1000,
};
