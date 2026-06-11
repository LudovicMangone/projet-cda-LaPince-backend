import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Only run files matching this pattern as integration tests
		include: ["**/*.integration.test.ts"],

		// Runs once before/after the entire test suite (starts Docker, server, migrations)
		globalSetup: ["./src/test/config/global-setup.ts"],

		// Runs before each test file (resets DB, mocks, etc.)
		setupFiles: ["./src/test/config/integration-setup.ts"],

		// Disable parallel execution: integration tests share a single DB and server instance
		fileParallelism: false,

		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			// Track coverage for all source files...
			include: ["src/**/*.ts"],
			// ...except entry points and generated/config files which are not business logic
			exclude: [
				"src/app.ts",
				"src/server.ts",
				"src/generated/**",
				"src/config/**",
				"src/**/*.test.ts",
				"src/test/**",
				"src/routers/**",
				"src/schemas/**",
				"src/lib/prisma.ts",
				"src/lib/rateLimiter.ts",
			],
		},
	},
});
