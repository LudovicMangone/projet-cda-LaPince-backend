import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.integration.test.ts"],
		// Set DATABASE_URL to localhost before dotenv loads .env
		setupFiles: ["./src/test/config/setup.integration.ts"],
		// Run test files sequentially to avoid port conflicts (app.listen on same port)
		fileParallelism: false,
		hookTimeout: 30000,
	},
});