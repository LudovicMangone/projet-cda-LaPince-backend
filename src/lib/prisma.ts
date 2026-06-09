import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma";

// To prevents memories problems with multiple pool creation without close precedent
// globalThis survives TSX Watch reloads — the pool and client
// are created only once and reused with each module reload
const globalForPrisma = globalThis as unknown as {
	pool: Pool;
	prisma: PrismaClient;
};

if (!globalForPrisma.pool) {
	globalForPrisma.pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});
}

if (!globalForPrisma.prisma) {
	const adapter = new PrismaPg(globalForPrisma.pool);
	globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
