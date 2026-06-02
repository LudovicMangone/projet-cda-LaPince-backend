import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import { PrismaClient, ProjectType } from "../generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding database...");

	// ============================================================
	// CATEGORIES
	// ============================================================

	const [divers, restaurants, hebergement, transport, courses, loisir] =
		await Promise.all([
			prisma.category.upsert({
				where: { color: "#A9A9A9" },
				update: {},
				create: { name: "Divers", color: "#A9A9A9" },
			}),
			prisma.category.upsert({
				where: { color: "#228B22" },
				update: {},
				create: { name: "Restaurants", color: "#228B22" },
			}),
			prisma.category.upsert({
				where: { color: "#1E90FF" },
				update: {},
				create: { name: "Hébergement", color: "#1E90FF" },
			}),
			prisma.category.upsert({
				where: { color: "#FF8C00" },
				update: {},
				create: { name: "Transport", color: "#FF8C00" },
			}),
			prisma.category.upsert({
				where: { color: "#6B8E23" },
				update: {},
				create: { name: "Courses", color: "#6B8E23" },
			}),
			prisma.category.upsert({
				where: { color: "#9370DB" },
				update: {},
				create: { name: "Loisir", color: "#9370DB" },
			}),
		]);

	console.log("✅ 6 categories seeded");

	// ============================================================
	// USERS
	// ============================================================

	const passwordHash = await argon2.hash("password123");

	const steve = await prisma.appUser.upsert({
		where: { email: "steve@lapince.fr" },
		update: {},
		create: {
			name: "Steve",
			email: "steve@lapince.fr",
			password: passwordHash,
		},
	});

	const aurore = await prisma.appUser.upsert({
		where: { email: "aurore@lapince.fr" },
		update: {},
		create: {
			name: "Aurore",
			email: "aurore@lapince.fr",
			password: passwordHash,
		},
	});

	console.log("✅ 2 users seeded");

	// ============================================================
	// PARTICIPANTS
	// ============================================================

	const pSteve = await prisma.participant.upsert({
		where: { id: 1 },
		update: {},
		create: { name: "Steve", appUserId: steve.id },
	});

	const pAurore = await prisma.participant.upsert({
		where: { id: 2 },
		update: {},
		create: { name: "Aurore", appUserId: aurore.id },
	});

	const pLudo = await prisma.participant.upsert({
		where: { id: 3 },
		update: {},
		create: { name: "Ludo", appUserId: null },
	});

	console.log("✅ 3 participants seeded");

	// ============================================================
	// PROJECT 1
	// ============================================================

	const projectMilan = await prisma.project.upsert({
		where: { id: 1 },
		update: {},
		create: {
			name: "Voyage Milan",
			description: "Voyage entre amis à Milan, mai 2026",
			type: ProjectType.Voyage,
			appUserId: steve.id,
		},
	});

	console.log("✅ 1 project seeded");

	// ============================================================
	// PROJECT 1 PARTICIPANTS
	// ============================================================

	for (const participantId of [pSteve.id, pAurore.id, pLudo.id]) {
		await prisma.projectParticipant.upsert({
			where: {
				projectId_participantId: {
					projectId: projectMilan.id,
					participantId,
				},
			},
			update: {},
			create: {
				projectId: projectMilan.id,
				participantId,
			},
		});
	}

	console.log("✅ project participants seeded");

	// ============================================================
	// PROJECT 1 BUDGET
	// ============================================================

	const budget = await prisma.budget.upsert({
		where: { projectId: projectMilan.id },
		update: {},
		create: {
			amount: 1200.0,
			limitCriteria: 80.0,
			projectId: projectMilan.id,
		},
	});

	console.log("✅ 1 budget seeded");

	// ============================================================
	// PROJECT 1 OPERATIONS
	// ============================================================

	const operations = [
		{
			id: 1,
			name: "Restaurant Il Duomo",
			amount: 84.5,
			date: "2026-05-20",
			payerId: pSteve.id,
			categoryId: restaurants.id,
			split: [28.17, 28.17, 28.16],
		},
		{
			id: 2,
			name: "Hôtel 2 nuits",
			amount: 360.0,
			date: "2026-05-19",
			payerId: pAurore.id,
			categoryId: hebergement.id,
			split: [120.0, 120.0, 120.0],
		},
		{
			id: 3,
			name: "Billets de train",
			amount: 150.0,
			date: "2026-05-18",
			payerId: pSteve.id,
			categoryId: transport.id,
			split: [50.0, 50.0, 50.0],
		},
	];

	for (const op of operations) {
		const created = await prisma.operation.upsert({
			where: { id: op.id },
			update: {},
			create: {
				name: op.name,
				amount: op.amount,
				date: new Date(op.date),
				payerParticipantId: op.payerId,
				appUserId: steve.id,
				categoryId: op.categoryId,
				projectId: projectMilan.id,
			},
		});

		const participants = [pSteve, pAurore, pLudo];

		for (let i = 0; i < participants.length; i++) {
			await prisma.operationParticipant.upsert({
				where: {
					operationId_participantId: {
						operationId: created.id,
						participantId: participants[i].id,
					},
				},
				update: {},
				create: {
					operationId: created.id,
					participantId: participants[i].id,
					repartitionAmount: op.split[i],
				},
			});
		}
	}

	console.log("✅ 3 operations + participants seeded");

	// ============================================================
	// PROJECT 2 (NEW OWNER)
	// ============================================================

	const projectParis = await prisma.project.upsert({
		where: { id: 2 },
		update: {},
		create: {
			name: "Week-end Paris",
			description: "Séjour à Paris pour test multi-projets",
			type: ProjectType.Voyage,
			appUserId: aurore.id,
		},
	});

	console.log("✅ 2nd project seeded");

	for (const participantId of [pAurore.id, pLudo.id]) {
		await prisma.projectParticipant.upsert({
			where: {
				projectId_participantId: {
					projectId: projectParis.id,
					participantId,
				},
			},
			update: {},
			create: {
				projectId: projectParis.id,
				participantId,
			},
		});
	}

	console.log("✅ project 2 participants seeded");

	await prisma.budget.upsert({
		where: { projectId: projectParis.id },
		update: {},
		create: {
			amount: 500.0,
			limitCriteria: 70.0,
			projectId: projectParis.id,
		},
	});

	console.log("✅ project 2 budget seeded");

	const operationsParis = [
		{
			id: 10,
			name: "Train aller-retour",
			amount: 120.0,
			date: "2026-05-21",
			payerId: pAurore.id,
			categoryId: transport.id,
			split: [60.0, 60.0],
		},
		{
			id: 11,
			name: "Hôtel Paris",
			amount: 200.0,
			date: "2026-05-21",
			payerId: pAurore.id,
			categoryId: hebergement.id,
			split: [100.0, 100.0],
		},
	];

	for (const op of operationsParis) {
		const created = await prisma.operation.upsert({
			where: { id: op.id },
			update: {},
			create: {
				name: op.name,
				amount: op.amount,
				date: new Date(op.date),
				payerParticipantId: op.payerId,
				appUserId: aurore.id,
				categoryId: op.categoryId,
				projectId: projectParis.id,
			},
		});

		const participants = [pAurore, pLudo];

		for (let i = 0; i < participants.length; i++) {
			await prisma.operationParticipant.upsert({
				where: {
					operationId_participantId: {
						operationId: created.id,
						participantId: participants[i].id,
					},
				},
				update: {},
				create: {
					operationId: created.id,
					participantId: participants[i].id,
					repartitionAmount: op.split[i],
				},
			});
		}
	}

	console.log("✅ project 2 operations seeded");

	console.log("🎉 Seeding complete!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
