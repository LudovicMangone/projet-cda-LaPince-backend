// Runs before EACH test file (setupFiles), inside the worker context.
// Responsible for: silencing logs, and wiping the DB between tests to ensure isolation.
import { afterAll, beforeEach, vi } from "vitest";
import { pool, prisma } from "../../../src/lib/prisma";

beforeEach(async () => {
	// Silence console.info during tests to keep output clean
	vi.spyOn(console, "info").mockImplementation(() => {});

	// Reset all tables before each test so tests never share state
	await truncateTables();
});

afterAll(async () => {
	// Release the Prisma and pg pool connections after the file's tests are done
	await prisma.$disconnect();
	await pool.end();
});

// Truncates every table in the public schema and resets auto-increment sequences
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
