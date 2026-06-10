import { config } from "dotenv";
import { beforeEach, vi } from "vitest";

// Load test env variables (needed for JWT_SECRET, etc.)
config({ path: ".env.test" });

beforeEach(() => {
	// Silence console.info during tests to keep output clean
	vi.spyOn(console, "info").mockImplementation(() => {});
});
