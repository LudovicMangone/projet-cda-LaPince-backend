import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { app } from "../../../src/app";
import { prisma } from "../../../src/lib/prisma";

let server: Server;

// ─── Avant tous les tests ─────────────────────────────────────
beforeAll(async () => {
  server = app.listen(3001);
});

// ─── Avant chaque test ────────────────────────────────────────
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

// ─── Après tous les tests ─────────────────────────────────────
afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});