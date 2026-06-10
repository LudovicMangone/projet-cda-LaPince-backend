import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { app } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";

// ================================================================================
// Integration test environment setup
//
// BEFORE ALL TESTS:
// - Start the Express server on a random available port (0 = OS picks it)
//
// BEFORE EACH TEST:
// - Truncate all tables to ensure a clean state between tests
//
// AFTER ALL TESTS:
// - Disconnect Prisma client
// - Close the Express server
//
// Prerequisites:
// - A dedicated test database must be running
// - .env.test must define DATABASE_URL pointing to that test database
// - The test:integration script must load .env.test via dotenv-cli
// ================================================================================

let server: Server;

// ─── Before all tests ────────────────────────────────────────────────────────
// Use port 0 so the OS assigns a free port automatically.
// Avoids conflicts if another process is already using a fixed port.
beforeAll(async () => {
	server = app.listen(0);
});

// ─── Before each test ────────────────────────────────────────────────────────
// Truncate all tables and reset auto-increment sequences.
// Order matters: child tables (with foreign keys) must be listed before parents,
// but CASCADE handles that here — explicit ordering still avoids constraint errors
// on databases where CASCADE is not fully reliable.
beforeEach(async () => {
	await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      operation_participant,
      operation,
      project_participant,
      app_user_alert,
      alert,
      budget,
      project,
      participant,
      category,
      app_user
    RESTART IDENTITY CASCADE
  `);
});

// ─── After all tests ─────────────────────────────────────────────────────────
// Always disconnect Prisma before closing the server to avoid
// open handle warnings from Vitest.
afterAll(async () => {
	await prisma.$disconnect();
	server.close();
});
