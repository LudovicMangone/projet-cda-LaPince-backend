import { execSync } from "node:child_process";
import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { defineConfig } from "vitest/config";
import { app } from "../../../src/app";
import { pool, prisma } from "../../../src/lib/prisma";

let server: Server;

// ─── Before all tests ────────────────────────────────────────────────────────
// Ensure the test container is removed if it already exists (leftover from a
// previous interrupted run), then spin up a fresh PostgreSQL container,
// wait for it to be ready, run migrations, and start the Express server.
beforeAll(() => {
	execSync(`docker rm -f lapincetest 2>/dev/null || true`);

	execSync(`
    docker run \
    -d \
    --name lapincetest \
    -p ${process.env.POSTGRES_PORT}:5432 \
    -e POSTGRES_USER=${process.env.POSTGRES_USER} \
    -e POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD} \
    -e POSTGRES_DB=${process.env.POSTGRES_DB} \
    postgres:18-alpine
  `);

	// Wait until PostgreSQL is ready to accept connections
	execSync(`
    until docker exec lapincetest pg_isready -U ${process.env.POSTGRES_USER} > /dev/null 2>&1; do
      sleep 0.5
    done
  `);

	// Apply migrations to the test database
	// Environment variables from .env.test are inherited by execSync
	execSync(`npx prisma migrate deploy`);

	// Start the Express server on a random available port
	server = app.listen(0);
});

// ─── Before each test ────────────────────────────────────────────────────────
// Silence console.info and truncate all tables to ensure a clean state.
beforeEach(async () => {
	vi.spyOn(console, "info").mockImplementation(() => {});
	await truncateTables();
});

// ─── After all tests ──────────────────────────────────────────────────────────
// Disconnect Prisma first, close the server, and remove the test container.
afterAll(async () => {
	await prisma.$disconnect();
	// Force close all pg pool connections before removing the container
	await pool.end();
	server.close();
	execSync(`docker rm -f lapincetest`);
});

// ─── Truncate all tables ──────────────────────────────────────────────────────
// Dynamically truncates every table in the public schema and resets sequences.
// More robust than a hardcoded list — works even when new tables are added.
async function truncateTables() {
	await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
      END LOOP;
    END $$;
  `);
}

// ─── Coverage ──────────────────────────────────────────────────────
export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "html"], // text = terminal, html = rapport visuel
			include: ["src/**/*.ts"], // fichiers à analyser
			exclude: [
				// fichiers à ignorer
				"src/app.ts",
				"src/server.ts",
				"src/generated/**",
				"src/config/**",
			],
		},
	},
});
