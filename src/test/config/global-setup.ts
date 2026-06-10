// Runs ONCE before all tests and ONCE after — not in a worker, in the main Vitest process.
// Responsible for: spinning up the test DB container, running migrations, starting the Express server.
import { execSync } from "node:child_process";
import type { Server } from "node:http";
import { config } from "dotenv";
import { app } from "../../../src/app";

// Load test environment variables before anything else
config({ path: ".env.test" });

let server: Server;

export async function setup() {
	// Remove any leftover container from a previous interrupted run
	try {
		execSync(`docker rm -f lapincetest`, { stdio: "pipe" });
	} catch {}

	// Start a fresh PostgreSQL container for the test session
	execSync(`docker run -d --name lapincetest \
    -p ${process.env.POSTGRES_PORT}:5432 \
    -e POSTGRES_USER=${process.env.POSTGRES_USER} \
    -e POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD} \
    -e POSTGRES_DB=${process.env.POSTGRES_DB} \
    postgres:18-alpine`);

	// Poll until Postgres is ready to accept connections before running migrations
	execSync(
		`until docker exec lapincetest pg_isready -U ${process.env.POSTGRES_USER} > /dev/null 2>&1; do sleep 0.5; done`,
	);

	// Apply all pending Prisma migrations to the test database
	execSync(`npx prisma migrate deploy`);

	// Start the Express app and wait for the server to be actually listening
	// Wrapping in a Promise avoids a race condition where server.address() returns null
	server = await new Promise<Server>((resolve, reject) => {
		const s = app.listen(Number(process.env.PORT) || 3001, () => resolve(s));
		s.once("error", reject);
	});

	const port = (server.address() as { port: number }).port;
	console.log("✅ Server started on port", port);
}

export async function teardown() {
	// Gracefully close the HTTP server
	server?.close();

	// Remove the test container to free resources
	execSync(`docker rm -f lapincetest`);
}
