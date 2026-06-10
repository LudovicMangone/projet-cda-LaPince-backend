import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.unit.test.ts"],
		setupFiles: ["./src/test/config/unit-setup.ts"], // ← ajouter
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.ts"],
			exclude: [
				"src/app.ts",
				"src/server.ts",
				"src/generated/**",
				"src/config/**",
				"src/**/*.test.ts",
				"src/test/**",
			],
		},
	},
});
