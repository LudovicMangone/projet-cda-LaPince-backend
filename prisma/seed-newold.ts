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
		create: { name: "Steve", email: "steve@lapince.fr", password: passwordHash },
	});

	const aurore = await prisma.appUser.upsert({
		where: { email: "aurore@lapince.fr" },
		update: {},
		create: { name: "Aurore", email: "aurore@lapince.fr", password: passwordHash },
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
	const pJerem = await prisma.participant.upsert({
		where: { id: 4 },
		update: {},
		create: { name: "Jerem", appUserId: null },
	});
	const pSophie = await prisma.participant.upsert({
		where: { id: 5 },
		update: {},
		create: { name: "Sophie", appUserId: null },
	});
	const pMarco = await prisma.participant.upsert({
		where: { id: 6 },
		update: {},
		create: { name: "Marco", appUserId: null },
	});
	const pLea = await prisma.participant.upsert({
		where: { id: 7 },
		update: {},
		create: { name: "Léa", appUserId: null },
	});
	const pThomas = await prisma.participant.upsert({
		where: { id: 8 },
		update: {},
		create: { name: "Thomas", appUserId: null },
	});

	console.log("✅ 8 participants seeded");

	// Helper — upsert operation + operation participants
	async function seedOperation(op: {
		id: number;
		name: string;
		amount: number;
		isAmountCalculated: boolean;
		date: string;
		payerId: number;
		categoryId: number;
		projectId: number;
		appUserId: number;
		split: { participantId: number; amount: number; isCalculated: boolean }[];
	}) {
		const created = await prisma.operation.upsert({
			where: { id: op.id },
			update: {},
			create: {
				name: op.name,
				amount: op.amount,
				isAmountCalculated: op.isAmountCalculated,
				date: new Date(op.date),
				payerParticipantId: op.payerId,
				appUserId: op.appUserId,
				categoryId: op.categoryId,
				projectId: op.projectId,
			},
		});
		for (const s of op.split) {
			await prisma.operationParticipant.upsert({
				where: {
					operationId_participantId: {
						operationId: created.id,
						participantId: s.participantId,
					},
				},
				update: {},
				create: {
					operationId: created.id,
					participantId: s.participantId,
					repartitionAmount: s.amount,
					isRepartitionAmountCalculated: s.isCalculated,
				},
			});
		}
	}

	// ============================================================
	// PROJECT 1 — Voyage Milan (steve)
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

	for (const participantId of [pSteve.id, pAurore.id, pLudo.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectMilan.id, participantId } },
			update: {},
			create: { projectId: projectMilan.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectMilan.id },
		update: {},
		create: { amount: 1200.0, limitCriteria: 80.0, projectId: projectMilan.id },
	});

	for (const op of [
		{
			id: 1, name: "Restaurant Il Duomo", amount: 84.5, isAmountCalculated: false, date: "2026-05-20",
			payerId: pSteve.id, categoryId: restaurants.id,
			split: [
				{ participantId: pSteve.id, amount: 28.17, isCalculated: true },
				{ participantId: pAurore.id, amount: 28.17, isCalculated: true },
				{ participantId: pLudo.id, amount: 28.16, isCalculated: true },
			],
		},
		{
			id: 2, name: "Hôtel 2 nuits", amount: 360.0, isAmountCalculated: false, date: "2026-05-19",
			payerId: pAurore.id, categoryId: hebergement.id,
			split: [
				{ participantId: pSteve.id, amount: 120.0, isCalculated: true },
				{ participantId: pAurore.id, amount: 120.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 120.0, isCalculated: true },
			],
		},
		{
			id: 3, name: "Billets de train", amount: 150.0, isAmountCalculated: false, date: "2026-05-18",
			payerId: pSteve.id, categoryId: transport.id,
			split: [
				{ participantId: pSteve.id, amount: 50.0, isCalculated: true },
				{ participantId: pAurore.id, amount: 50.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 50.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectMilan.id, appUserId: steve.id });
	}

	console.log("✅ project 1 seeded");

	// ============================================================
	// PROJECT 2 — Week-end Paris (aurore)
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

	for (const participantId of [pAurore.id, pLudo.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectParis.id, participantId } },
			update: {},
			create: { projectId: projectParis.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectParis.id },
		update: {},
		create: { amount: 500.0, limitCriteria: 70.0, projectId: projectParis.id },
	});

	for (const op of [
		{
			id: 10, name: "Train aller-retour", amount: 120.0, isAmountCalculated: false, date: "2026-05-21",
			payerId: pAurore.id, categoryId: transport.id,
			split: [
				{ participantId: pAurore.id, amount: 60.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 60.0, isCalculated: true },
			],
		},
		{
			id: 11, name: "Hôtel Paris", amount: 200.0, isAmountCalculated: false, date: "2026-05-21",
			payerId: pAurore.id, categoryId: hebergement.id,
			split: [
				{ participantId: pAurore.id, amount: 100.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 100.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectParis.id, appUserId: aurore.id });
	}

	console.log("✅ project 2 seeded");

	// ============================================================
	// PROJECT 3 — Coloc rue Pasteur (steve)
	// ============================================================

	const projectColoc = await prisma.project.upsert({
		where: { id: 3 },
		update: {},
		create: {
			name: "Coloc rue Pasteur",
			description: "Dépenses partagées de la colocation",
			type: ProjectType.Maison_Coloc,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pLudo.id, pJerem.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectColoc.id, participantId } },
			update: {},
			create: { projectId: projectColoc.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectColoc.id },
		update: {},
		create: { amount: 2000.0, limitCriteria: 90.0, projectId: projectColoc.id },
	});

	for (const op of [
		{
			id: 20, name: "Loyer mai", amount: 900.0, isAmountCalculated: false, date: "2026-05-01",
			payerId: pSteve.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 300.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 300.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 300.0, isCalculated: true },
			],
		},
		{
			id: 21, name: "Courses Leclerc", amount: 87.4, isAmountCalculated: false, date: "2026-05-10",
			payerId: pLudo.id, categoryId: courses.id,
			split: [
				{ participantId: pSteve.id, amount: 29.14, isCalculated: true },
				{ participantId: pLudo.id, amount: 29.13, isCalculated: true },
				{ participantId: pJerem.id, amount: 29.13, isCalculated: true },
			],
		},
		{
			id: 22, name: "Internet + box", amount: 39.99, isAmountCalculated: false, date: "2026-05-05",
			payerId: pJerem.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 13.33, isCalculated: true },
				{ participantId: pLudo.id, amount: 13.33, isCalculated: true },
				{ participantId: pJerem.id, amount: 13.33, isCalculated: true },
			],
		},
		{
			id: 23, name: "Électricité", amount: 62.0, isAmountCalculated: false, date: "2026-05-15",
			payerId: pSteve.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 20.67, isCalculated: true },
				{ participantId: pLudo.id, amount: 20.67, isCalculated: true },
				{ participantId: pJerem.id, amount: 20.66, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectColoc.id, appUserId: steve.id });
	}

	console.log("✅ project 3 seeded");

	// ============================================================
	// PROJECT 4 — Anniversaire Léa (steve)
	// ============================================================

	const projectAnniv = await prisma.project.upsert({
		where: { id: 4 },
		update: {},
		create: {
			name: "Anniversaire Léa",
			description: "Organisation des 30 ans de Léa",
			type: ProjectType.Anniversaire,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pAurore.id, pSophie.id, pMarco.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectAnniv.id, participantId } },
			update: {},
			create: { projectId: projectAnniv.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectAnniv.id },
		update: {},
		create: { amount: 400.0, limitCriteria: 75.0, projectId: projectAnniv.id },
	});

	for (const op of [
		{
			id: 30, name: "Location salle", amount: 150.0, isAmountCalculated: false, date: "2026-06-01",
			payerId: pSteve.id, categoryId: loisir.id,
			split: [
				{ participantId: pSteve.id, amount: 37.5, isCalculated: true },
				{ participantId: pAurore.id, amount: 37.5, isCalculated: true },
				{ participantId: pSophie.id, amount: 37.5, isCalculated: true },
				{ participantId: pMarco.id, amount: 37.5, isCalculated: true },
			],
		},
		{
			id: 31, name: "Gâteau personnalisé", amount: 65.0, isAmountCalculated: false, date: "2026-06-01",
			payerId: pAurore.id, categoryId: restaurants.id,
			split: [
				{ participantId: pSteve.id, amount: 16.25, isCalculated: true },
				{ participantId: pAurore.id, amount: 16.25, isCalculated: true },
				{ participantId: pSophie.id, amount: 16.25, isCalculated: true },
				{ participantId: pMarco.id, amount: 16.25, isCalculated: true },
			],
		},
		{
			id: 32, name: "Décorations", amount: 42.8, isAmountCalculated: false, date: "2026-05-28",
			payerId: pSophie.id, categoryId: loisir.id,
			split: [
				{ participantId: pSteve.id, amount: 10.7, isCalculated: true },
				{ participantId: pAurore.id, amount: 10.7, isCalculated: true },
				{ participantId: pSophie.id, amount: 10.7, isCalculated: true },
				{ participantId: pMarco.id, amount: 10.7, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectAnniv.id, appUserId: steve.id });
	}

	console.log("✅ project 4 seeded");

	// ============================================================
	// PROJECT 5 — Soirée raclette (steve, sans budget)
	// ============================================================

	const projectRaclette = await prisma.project.upsert({
		where: { id: 5 },
		update: {},
		create: {
			name: "Soirée raclette",
			description: "Raclette du vendredi soir",
			type: ProjectType.Repas_Sortie,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pJerem.id, pLea.id, pThomas.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectRaclette.id, participantId } },
			update: {},
			create: { projectId: projectRaclette.id, participantId },
		});
	}

	for (const op of [
		{
			id: 40, name: "Fromages et charcuterie", amount: 54.6, isAmountCalculated: false, date: "2026-05-24",
			payerId: pSteve.id, categoryId: courses.id,
			split: [
				{ participantId: pSteve.id, amount: 13.65, isCalculated: true },
				{ participantId: pJerem.id, amount: 13.65, isCalculated: true },
				{ participantId: pLea.id, amount: 13.65, isCalculated: true },
				{ participantId: pThomas.id, amount: 13.65, isCalculated: true },
			],
		},
		{
			id: 41, name: "Vins et boissons", amount: 28.0, isAmountCalculated: false, date: "2026-05-24",
			payerId: pJerem.id, categoryId: courses.id,
			split: [
				{ participantId: pSteve.id, amount: 7.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 7.0, isCalculated: true },
				{ participantId: pLea.id, amount: 7.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 7.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectRaclette.id, appUserId: steve.id });
	}

	console.log("✅ project 5 seeded");

	// ============================================================
	// PROJECT 6 — Road trip Bretagne (steve)
	// ============================================================

	const projectBretagne = await prisma.project.upsert({
		where: { id: 6 },
		update: {},
		create: {
			name: "Road trip Bretagne",
			description: "10 jours sur les côtes bretonnes",
			type: ProjectType.Voyage,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pSophie.id, pMarco.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectBretagne.id, participantId } },
			update: {},
			create: { projectId: projectBretagne.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectBretagne.id },
		update: {},
		create: { amount: 1800.0, limitCriteria: 85.0, projectId: projectBretagne.id },
	});

	for (const op of [
		{
			id: 50, name: "Location voiture", amount: 320.0, isAmountCalculated: false, date: "2026-07-01",
			payerId: pSteve.id, categoryId: transport.id,
			split: [
				{ participantId: pSteve.id, amount: 106.67, isCalculated: true },
				{ participantId: pSophie.id, amount: 106.67, isCalculated: true },
				{ participantId: pMarco.id, amount: 106.66, isCalculated: true },
			],
		},
		{
			id: 51, name: "Camping 5 nuits", amount: 210.0, isAmountCalculated: false, date: "2026-07-02",
			payerId: pMarco.id, categoryId: hebergement.id,
			split: [
				{ participantId: pSteve.id, amount: 70.0, isCalculated: true },
				{ participantId: pSophie.id, amount: 70.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 70.0, isCalculated: true },
			],
		},
		{
			id: 52, name: "Restaurants divers", amount: 145.0, isAmountCalculated: false, date: "2026-07-04",
			payerId: pSophie.id, categoryId: restaurants.id,
			split: [
				{ participantId: pSteve.id, amount: 48.34, isCalculated: true },
				{ participantId: pSophie.id, amount: 48.33, isCalculated: true },
				{ participantId: pMarco.id, amount: 48.33, isCalculated: true },
			],
		},
		{
			id: 53, name: "Carburant", amount: 98.5, isAmountCalculated: false, date: "2026-07-03",
			payerId: pSteve.id, categoryId: transport.id,
			split: [
				{ participantId: pSteve.id, amount: 32.84, isCalculated: true },
				{ participantId: pSophie.id, amount: 32.83, isCalculated: true },
				{ participantId: pMarco.id, amount: 32.83, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectBretagne.id, appUserId: steve.id });
	}

	console.log("✅ project 6 seeded");

	// ============================================================
	// PROJECT 7 — Séminaire équipe (steve, Pro)
	// ============================================================

	const projectSeminaire = await prisma.project.upsert({
		where: { id: 7 },
		update: {},
		create: {
			name: "Séminaire équipe",
			description: "Séminaire annuel de l'équipe tech",
			type: ProjectType.Pro_Travail,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pThomas.id, pLea.id, pMarco.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectSeminaire.id, participantId } },
			update: {},
			create: { projectId: projectSeminaire.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectSeminaire.id },
		update: {},
		create: { amount: 3000.0, limitCriteria: 80.0, projectId: projectSeminaire.id },
	});

	for (const op of [
		{
			id: 60, name: "Hôtel 2 nuits équipe", amount: 880.0, isAmountCalculated: false, date: "2026-04-10",
			payerId: pSteve.id, categoryId: hebergement.id,
			split: [
				{ participantId: pSteve.id, amount: 220.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 220.0, isCalculated: true },
				{ participantId: pLea.id, amount: 220.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 220.0, isCalculated: true },
			],
		},
		{
			id: 61, name: "Dîner gala", amount: 340.0, isAmountCalculated: false, date: "2026-04-11",
			payerId: pThomas.id, categoryId: restaurants.id,
			split: [
				{ participantId: pSteve.id, amount: 85.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 85.0, isCalculated: true },
				{ participantId: pLea.id, amount: 85.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 85.0, isCalculated: true },
			],
		},
		{
			id: 62, name: "Matériel atelier", amount: 127.5, isAmountCalculated: false, date: "2026-04-10",
			payerId: pLea.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 31.88, isCalculated: true },
				{ participantId: pThomas.id, amount: 31.87, isCalculated: true },
				{ participantId: pLea.id, amount: 31.87, isCalculated: true },
				{ participantId: pMarco.id, amount: 31.88, isCalculated: true },
			],
		},
		{
			id: 63, name: "Transport groupe", amount: 210.0, isAmountCalculated: false, date: "2026-04-10",
			payerId: pSteve.id, categoryId: transport.id,
			split: [
				{ participantId: pSteve.id, amount: 52.5, isCalculated: true },
				{ participantId: pThomas.id, amount: 52.5, isCalculated: true },
				{ participantId: pLea.id, amount: 52.5, isCalculated: true },
				{ participantId: pMarco.id, amount: 52.5, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectSeminaire.id, appUserId: steve.id });
	}

	console.log("✅ project 7 seeded");

	// ============================================================
	// PROJECT 8 — Festival été 2025 (steve, archivé)
	// ============================================================

	const projectFestival = await prisma.project.upsert({
		where: { id: 8 },
		update: {},
		create: {
			name: "Festival été 2025",
			description: "Hellfest avec les potes — édition 2025",
			type: ProjectType.Autre,
			appUserId: steve.id,
			isArchived: true,
		},
	});

	for (const participantId of [pSteve.id, pJerem.id, pThomas.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectFestival.id, participantId } },
			update: {},
			create: { projectId: projectFestival.id, participantId },
		});
	}

	for (const op of [
		{
			id: 70, name: "Pass 3 jours x3", amount: 450.0, isAmountCalculated: false, date: "2025-06-20",
			payerId: pSteve.id, categoryId: loisir.id,
			split: [
				{ participantId: pSteve.id, amount: 150.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 150.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 150.0, isCalculated: true },
			],
		},
		{
			id: 71, name: "Camping sur place", amount: 90.0, isAmountCalculated: false, date: "2025-06-20",
			payerId: pJerem.id, categoryId: hebergement.id,
			split: [
				{ participantId: pSteve.id, amount: 30.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 30.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 30.0, isCalculated: true },
			],
		},
		{
			id: 72, name: "Nourriture festival", amount: 138.0, isAmountCalculated: false, date: "2025-06-21",
			payerId: pThomas.id, categoryId: restaurants.id,
			split: [
				{ participantId: pSteve.id, amount: 46.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 46.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 46.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectFestival.id, appUserId: steve.id });
	}

	console.log("✅ project 8 seeded");

	// ============================================================
	// PROJECT 9 — Cuisine du monde (steve)
	// ============================================================

	const projectCuisine = await prisma.project.upsert({
		where: { id: 9 },
		update: {},
		create: {
			name: "Cuisine du monde",
			description: "Soirées thématiques cuisine entre amis",
			type: ProjectType.Repas_Sortie,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pAurore.id, pLea.id, pSophie.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectCuisine.id, participantId } },
			update: {},
			create: { projectId: projectCuisine.id, participantId },
		});
	}

	for (const op of [
		{
			id: 80, name: "Soirée japonaise", amount: 67.3, isAmountCalculated: false, date: "2026-03-15",
			payerId: pAurore.id, categoryId: courses.id,
			split: [
				{ participantId: pSteve.id, amount: 16.83, isCalculated: true },
				{ participantId: pAurore.id, amount: 16.82, isCalculated: true },
				{ participantId: pLea.id, amount: 16.82, isCalculated: true },
				{ participantId: pSophie.id, amount: 16.83, isCalculated: true },
			],
		},
		{
			id: 81, name: "Soirée mexicaine", amount: 54.9, isAmountCalculated: false, date: "2026-04-05",
			payerId: pSteve.id, categoryId: courses.id,
			split: [
				{ participantId: pSteve.id, amount: 13.73, isCalculated: true },
				{ participantId: pAurore.id, amount: 13.72, isCalculated: true },
				{ participantId: pLea.id, amount: 13.72, isCalculated: true },
				{ participantId: pSophie.id, amount: 13.73, isCalculated: true },
			],
		},
		{
			id: 82, name: "Soirée indienne", amount: 71.0, isAmountCalculated: false, date: "2026-05-03",
			payerId: pLea.id, categoryId: courses.id,
			split: [
				{ participantId: pSteve.id, amount: 17.75, isCalculated: true },
				{ participantId: pAurore.id, amount: 17.75, isCalculated: true },
				{ participantId: pLea.id, amount: 17.75, isCalculated: true },
				{ participantId: pSophie.id, amount: 17.75, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectCuisine.id, appUserId: steve.id });
	}

	console.log("✅ project 9 seeded");

	// ============================================================
	// PROJECT 10 — Réno appart Steve
	// ============================================================

	const projectReno = await prisma.project.upsert({
		where: { id: 10 },
		update: {},
		create: {
			name: "Réno appart Steve",
			description: "Travaux de rénovation de l'appartement",
			type: ProjectType.Maison_Coloc,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pMarco.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectReno.id, participantId } },
			update: {},
			create: { projectId: projectReno.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectReno.id },
		update: {},
		create: { amount: 5000.0, limitCriteria: 90.0, projectId: projectReno.id },
	});

	for (const op of [
		{
			id: 90, name: "Peinture salon", amount: 280.0, isAmountCalculated: false, date: "2026-02-10",
			payerId: pSteve.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 140.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 140.0, isCalculated: true },
			],
		},
		{
			id: 91, name: "Parquet chambre", amount: 1200.0, isAmountCalculated: false, date: "2026-02-15",
			payerId: pMarco.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 600.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 600.0, isCalculated: true },
			],
		},
		{
			id: 92, name: "Électricien", amount: 450.0, isAmountCalculated: false, date: "2026-03-01",
			payerId: pSteve.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 225.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 225.0, isCalculated: true },
			],
		},
		{
			id: 93, name: "Plombier salle de bain", amount: 390.0, isAmountCalculated: false, date: "2026-03-10",
			payerId: pSteve.id, categoryId: divers.id,
			split: [
				{ participantId: pSteve.id, amount: 195.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 195.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectReno.id, appUserId: steve.id });
	}

	console.log("✅ project 10 seeded");

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
