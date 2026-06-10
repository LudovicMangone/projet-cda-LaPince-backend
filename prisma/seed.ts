import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import { PrismaClient, ProjectType } from "../generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding database...");

	// ============================================================
	// CATEGORIES — 6 catégories exhaustives
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
	// password123 pour tous les comptes (hors demo)
	// demo@lapince.fr → compte de présentation jury
	// ============================================================

	const passwordHash = await argon2.hash("password123");
	const demoHash = await argon2.hash("demo1234");

	const demo = await prisma.appUser.upsert({
		where: { email: "demo@lapince.fr" },
		update: {},
		create: { name: "Demo", email: "demo@lapince.fr", password: demoHash },
	});

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

	const ludo = await prisma.appUser.upsert({
		where: { email: "ludo@lapince.fr" },
		update: {},
		create: { name: "Ludo", email: "ludo@lapince.fr", password: passwordHash },
	});

	const jerem = await prisma.appUser.upsert({
		where: { email: "jerem@lapince.fr" },
		update: {},
		create: { name: "Jérémy", email: "jerem@lapince.fr", password: passwordHash },
	});

	console.log("✅ 5 users seeded (demo + steve + aurore + ludo + jerem)");

	// ============================================================
	// PARTICIPANTS
	// Certains sont liés à un compte (appUserId), d'autres non (invités)
	// ============================================================

	// Participants avec compte
	const pDemo = await prisma.participant.upsert({
		where: { id: 1 },
		update: {},
		create: { name: "Demo", appUserId: demo.id },
	});
	const pSteve = await prisma.participant.upsert({
		where: { id: 2 },
		update: {},
		create: { name: "Steve", appUserId: steve.id },
	});
	const pAurore = await prisma.participant.upsert({
		where: { id: 3 },
		update: {},
		create: { name: "Aurore", appUserId: aurore.id },
	});
	const pLudo = await prisma.participant.upsert({
		where: { id: 4 },
		update: {},
		create: { name: "Ludo", appUserId: ludo.id },
	});
	const pJerem = await prisma.participant.upsert({
		where: { id: 5 },
		update: {},
		create: { name: "Jérémy", appUserId: jerem.id },
	});

	// Participants invités (sans compte)
	const pSophie = await prisma.participant.upsert({
		where: { id: 6 },
		update: {},
		create: { name: "Sophie", appUserId: null },
	});
	const pMarco = await prisma.participant.upsert({
		where: { id: 7 },
		update: {},
		create: { name: "Marco", appUserId: null },
	});
	const pLea = await prisma.participant.upsert({
		where: { id: 8 },
		update: {},
		create: { name: "Léa", appUserId: null },
	});
	const pThomas = await prisma.participant.upsert({
		where: { id: 9 },
		update: {},
		create: { name: "Thomas", appUserId: null },
	});

	console.log("✅ 9 participants seeded (5 avec compte, 4 invités)");

	// ============================================================
	// HELPER — upsert opération + répartitions
	// ============================================================

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
	// HELPER — upsert alerte + liaison AppUserAlert
	// ============================================================

	async function seedAlert(alert: {
		id: number;
		status: string; // "unread" | "read" | "resolved"
		message: string;
		budgetId: number;
		appUserIds: number[];
	}) {
		await prisma.alert.upsert({
			where: { id: alert.id },
			update: {},
			create: {
				id: alert.id,
				status: alert.status,
				message: alert.message,
				budgetId: alert.budgetId,
			},
		});
		for (const uid of alert.appUserIds) {
			await prisma.appUserAlert.upsert({
				where: { appUserId_alertId: { appUserId: uid, alertId: alert.id } },
				update: {},
				create: { appUserId: uid, alertId: alert.id },
			});
		}
	}

	// ============================================================
	// PROJECT 1 — Voyage Milan (demo)
	// Cas : budget dépassé → alerte unread (pour la démo jury)
	// Balances : 3 participants → 2 transactions greedy
	// Type : Voyage ✅
	// ============================================================

	const projectMilan = await prisma.project.upsert({
		where: { id: 1 },
		update: {},
		create: {
			name: "Voyage Milan",
			description: "Week-end entre amis à Milan — mai 2026",
			type: ProjectType.Voyage,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pSophie.id, pMarco.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectMilan.id, participantId } },
			update: {},
			create: { projectId: projectMilan.id, participantId },
		});
	}

	// Budget : 500 €, seuil 80 % → dépenses à 490 € → alerte déclenchée
	const budgetMilan = await prisma.budget.upsert({
		where: { projectId: projectMilan.id },
		update: {},
		create: { amount: 500.0, limitCriteria: 80.0, projectId: projectMilan.id },
	});

	for (const op of [
		{
			id: 1,
			name: "Hôtel 2 nuits",
			amount: 270.0,
			isAmountCalculated: false,
			date: "2026-05-19",
			payerId: pDemo.id,
			categoryId: hebergement.id,
			split: [
				{ participantId: pDemo.id, amount: 90.0, isCalculated: true },
				{ participantId: pSophie.id, amount: 90.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 90.0, isCalculated: true },
			],
		},
		{
			id: 2,
			name: "Restaurant Il Duomo",
			amount: 120.0,
			isAmountCalculated: false,
			date: "2026-05-20",
			// Sophie paie mais ne mange pas (elle a commandé pour les autres)
			// → cas payeur absent de sa propre répartition
			payerId: pSophie.id,
			categoryId: restaurants.id,
			split: [
				{ participantId: pDemo.id, amount: 60.0, isCalculated: false },
				{ participantId: pMarco.id, amount: 60.0, isCalculated: false },
			],
		},
		{
			id: 3,
			name: "Billets de train",
			amount: 100.0,
			isAmountCalculated: false,
			date: "2026-05-18",
			payerId: pMarco.id,
			categoryId: transport.id,
			split: [
				{ participantId: pDemo.id, amount: 33.34, isCalculated: true },
				{ participantId: pSophie.id, amount: 33.33, isCalculated: true },
				{ participantId: pMarco.id, amount: 33.33, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectMilan.id, appUserId: demo.id });
	}

	// Alerte unread → dépassement du seuil 80 % (490 € > 400 €)
	await seedAlert({
		id: 1,
		status: "unread",
		message: "Le budget de Voyage Milan a dépassé 80 % du montant prévu (490,00 € sur 500,00 €).",
		budgetId: budgetMilan.id,
		appUserIds: [demo.id],
	});

	console.log("✅ project 1 seeded — Voyage Milan (démo, alerte unread)");

	// ============================================================
	// PROJECT 2 — Coloc rue Pasteur (demo)
	// Cas : budget avec alerte déjà lue (status: "read")
	// Balances complexes : 3 participants → 2+ transactions greedy
	// Type : Maison_Coloc ✅
	// ============================================================

	const projectColoc = await prisma.project.upsert({
		where: { id: 2 },
		update: {},
		create: {
			name: "Coloc rue Pasteur",
			description: "Dépenses partagées de la colocation — juin 2026",
			type: ProjectType.Maison_Coloc,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pLudo.id, pJerem.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectColoc.id, participantId } },
			update: {},
			create: { projectId: projectColoc.id, participantId },
		});
	}

	// Budget : 2000 €, seuil 90 % → 1089,39 € dépensés → sous le seuil (alerte read = historique)
	const budgetColoc = await prisma.budget.upsert({
		where: { projectId: projectColoc.id },
		update: {},
		create: { amount: 2000.0, limitCriteria: 90.0, projectId: projectColoc.id },
	});

	for (const op of [
		{
			id: 10,
			name: "Loyer juin",
			amount: 900.0,
			isAmountCalculated: false,
			date: "2026-06-01",
			payerId: pDemo.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 300.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 300.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 300.0, isCalculated: true },
			],
		},
		{
			id: 11,
			name: "Courses Leclerc",
			amount: 87.4,
			isAmountCalculated: false,
			date: "2026-06-10",
			payerId: pLudo.id,
			categoryId: courses.id,
			split: [
				{ participantId: pDemo.id, amount: 29.14, isCalculated: true },
				{ participantId: pLudo.id, amount: 29.13, isCalculated: true },
				{ participantId: pJerem.id, amount: 29.13, isCalculated: true },
			],
		},
		{
			id: 12,
			name: "Internet + box",
			amount: 39.99,
			isAmountCalculated: false,
			date: "2026-06-05",
			payerId: pJerem.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 13.33, isCalculated: true },
				{ participantId: pLudo.id, amount: 13.33, isCalculated: true },
				{ participantId: pJerem.id, amount: 13.33, isCalculated: true },
			],
		},
		{
			id: 13,
			name: "Électricité",
			amount: 62.0,
			isAmountCalculated: false,
			date: "2026-06-15",
			payerId: pDemo.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 20.67, isCalculated: true },
				{ participantId: pLudo.id, amount: 20.67, isCalculated: true },
				{ participantId: pJerem.id, amount: 20.66, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectColoc.id, appUserId: demo.id });
	}

	// Alerte read → visible dans l'historique mais pas dans le bandeau
	await seedAlert({
		id: 2,
		status: "read",
		message: "Le budget de Coloc rue Pasteur a dépassé 50 % du montant prévu (1 089,39 € sur 2 000,00 €).",
		budgetId: budgetColoc.id,
		appUserIds: [demo.id],
	});

	console.log("✅ project 2 seeded — Coloc rue Pasteur (démo, alerte read)");

	// ============================================================
	// PROJECT 3 — Anniversaire Léa (demo)
	// Cas : répartition inégale (parts custom), budget resolved
	// Balances : 4 participants → algo greedy testé sur ≥ 3 transactions
	// Type : Anniversaire ✅
	// ============================================================

	const projectAnniv = await prisma.project.upsert({
		where: { id: 3 },
		update: {},
		create: {
			name: "Anniversaire Léa",
			description: "Organisation des 30 ans de Léa",
			type: ProjectType.Anniversaire,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pAurore.id, pSophie.id, pMarco.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectAnniv.id, participantId } },
			update: {},
			create: { projectId: projectAnniv.id, participantId },
		});
	}

	// Budget : 400 €, seuil 75 % → 257,80 € < 300 € → alerte resolved (le budget a été augmenté)
	const budgetAnniv = await prisma.budget.upsert({
		where: { projectId: projectAnniv.id },
		update: {},
		create: { amount: 400.0, limitCriteria: 75.0, projectId: projectAnniv.id },
	});

	for (const op of [
		{
			id: 20,
			name: "Location salle",
			amount: 150.0,
			isAmountCalculated: false,
			date: "2026-06-01",
			payerId: pDemo.id,
			categoryId: loisir.id,
			// Répartition inégale : Demo et Aurore organisent, paient plus
			split: [
				{ participantId: pDemo.id, amount: 50.0, isCalculated: false },
				{ participantId: pAurore.id, amount: 50.0, isCalculated: false },
				{ participantId: pSophie.id, amount: 25.0, isCalculated: false },
				{ participantId: pMarco.id, amount: 25.0, isCalculated: false },
			],
		},
		{
			id: 21,
			name: "Gâteau personnalisé",
			amount: 65.0,
			isAmountCalculated: false,
			date: "2026-06-01",
			payerId: pAurore.id,
			categoryId: restaurants.id,
			split: [
				{ participantId: pDemo.id, amount: 16.25, isCalculated: true },
				{ participantId: pAurore.id, amount: 16.25, isCalculated: true },
				{ participantId: pSophie.id, amount: 16.25, isCalculated: true },
				{ participantId: pMarco.id, amount: 16.25, isCalculated: true },
			],
		},
		{
			id: 22,
			name: "Décorations",
			amount: 42.8,
			isAmountCalculated: false,
			date: "2026-05-28",
			payerId: pSophie.id,
			categoryId: loisir.id,
			split: [
				{ participantId: pDemo.id, amount: 10.7, isCalculated: true },
				{ participantId: pAurore.id, amount: 10.7, isCalculated: true },
				{ participantId: pSophie.id, amount: 10.7, isCalculated: true },
				{ participantId: pMarco.id, amount: 10.7, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectAnniv.id, appUserId: demo.id });
	}

	// Alerte resolved → l'alerte a été déclenchée puis le budget corrigé
	await seedAlert({
		id: 3,
		status: "resolved",
		message: "Le budget de Anniversaire Léa a dépassé 75 % du montant prévu. Seuil dépassé puis résolu.",
		budgetId: budgetAnniv.id,
		appUserIds: [demo.id],
	});

	console.log("✅ project 3 seeded — Anniversaire Léa (démo, alerte resolved)");

	// ============================================================
	// PROJECT 4 — Soirée raclette (demo)
	// Cas : projet SANS budget — aucun Budget lié
	// Toutes les balances sont nulles (chacun a payé exactement sa part)
	// Type : Repas_Sortie ✅
	// ============================================================

	const projectRaclette = await prisma.project.upsert({
		where: { id: 4 },
		update: {},
		create: {
			name: "Soirée raclette",
			description: "Raclette du vendredi soir — pas de budget défini",
			type: ProjectType.Repas_Sortie,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pJerem.id, pLea.id, pThomas.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectRaclette.id, participantId } },
			update: {},
			create: { projectId: projectRaclette.id, participantId },
		});
	}

	// Pas de budget → aucun prisma.budget.upsert ici

	for (const op of [
		{
			id: 30,
			name: "Fromages et charcuterie",
			amount: 54.6,
			isAmountCalculated: false,
			date: "2026-05-24",
			payerId: pDemo.id,
			categoryId: courses.id,
			split: [
				{ participantId: pDemo.id, amount: 13.65, isCalculated: true },
				{ participantId: pJerem.id, amount: 13.65, isCalculated: true },
				{ participantId: pLea.id, amount: 13.65, isCalculated: true },
				{ participantId: pThomas.id, amount: 13.65, isCalculated: true },
			],
		},
		{
			id: 31,
			name: "Vins et boissons",
			amount: 28.0,
			isAmountCalculated: false,
			date: "2026-05-24",
			payerId: pJerem.id,
			categoryId: courses.id,
			split: [
				{ participantId: pDemo.id, amount: 7.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 7.0, isCalculated: true },
				{ participantId: pLea.id, amount: 7.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 7.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectRaclette.id, appUserId: demo.id });
	}

	console.log("✅ project 4 seeded — Soirée raclette (sans budget, balances nulles)");

	// ============================================================
	// PROJECT 5 — Séminaire équipe (demo)
	// Cas : budget large non dépassé (0 alerte)
	// Type : Pro_Travail ✅
	// ============================================================

	const projectSeminaire = await prisma.project.upsert({
		where: { id: 5 },
		update: {},
		create: {
			name: "Séminaire équipe",
			description: "Séminaire annuel de l'équipe tech",
			type: ProjectType.Pro_Travail,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pThomas.id, pLea.id, pMarco.id]) {
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
			id: 40,
			name: "Hôtel 2 nuits équipe",
			amount: 880.0,
			isAmountCalculated: false,
			date: "2026-04-10",
			payerId: pDemo.id,
			categoryId: hebergement.id,
			split: [
				{ participantId: pDemo.id, amount: 220.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 220.0, isCalculated: true },
				{ participantId: pLea.id, amount: 220.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 220.0, isCalculated: true },
			],
		},
		{
			id: 41,
			name: "Dîner gala",
			amount: 340.0,
			isAmountCalculated: false,
			date: "2026-04-11",
			payerId: pThomas.id,
			categoryId: restaurants.id,
			split: [
				{ participantId: pDemo.id, amount: 85.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 85.0, isCalculated: true },
				{ participantId: pLea.id, amount: 85.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 85.0, isCalculated: true },
			],
		},
		{
			id: 42,
			name: "Matériel atelier",
			amount: 127.5,
			isAmountCalculated: false,
			date: "2026-04-10",
			payerId: pLea.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 31.88, isCalculated: true },
				{ participantId: pThomas.id, amount: 31.87, isCalculated: true },
				{ participantId: pLea.id, amount: 31.87, isCalculated: true },
				{ participantId: pMarco.id, amount: 31.88, isCalculated: true },
			],
		},
		{
			id: 43,
			name: "Transport groupe",
			amount: 210.0,
			isAmountCalculated: false,
			date: "2026-04-10",
			payerId: pDemo.id,
			categoryId: transport.id,
			split: [
				{ participantId: pDemo.id, amount: 52.5, isCalculated: true },
				{ participantId: pThomas.id, amount: 52.5, isCalculated: true },
				{ participantId: pLea.id, amount: 52.5, isCalculated: true },
				{ participantId: pMarco.id, amount: 52.5, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectSeminaire.id, appUserId: demo.id });
	}

	console.log("✅ project 5 seeded — Séminaire équipe (Pro_Travail, budget non atteint)");

	// ============================================================
	// PROJECT 6 — Festival été 2025 (demo, ARCHIVÉ)
	// Cas : projet archivé → visible uniquement dans onglet Archives
	// Sans budget (projet clos)
	// Type : Autre ✅
	// ============================================================

	const projectFestival = await prisma.project.upsert({
		where: { id: 6 },
		update: {},
		create: {
			name: "Festival été 2025",
			description: "Hellfest avec les potes — édition 2025",
			type: ProjectType.Autre,
			appUserId: demo.id,
			isArchived: true,
		},
	});

	for (const participantId of [pDemo.id, pJerem.id, pThomas.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectFestival.id, participantId } },
			update: {},
			create: { projectId: projectFestival.id, participantId },
		});
	}

	for (const op of [
		{
			id: 50,
			name: "Pass 3 jours x3",
			amount: 450.0,
			isAmountCalculated: false,
			date: "2025-06-20",
			payerId: pDemo.id,
			categoryId: loisir.id,
			split: [
				{ participantId: pDemo.id, amount: 150.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 150.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 150.0, isCalculated: true },
			],
		},
		{
			id: 51,
			name: "Camping sur place",
			amount: 90.0,
			isAmountCalculated: false,
			date: "2025-06-20",
			payerId: pJerem.id,
			categoryId: hebergement.id,
			split: [
				{ participantId: pDemo.id, amount: 30.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 30.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 30.0, isCalculated: true },
			],
		},
		{
			id: 52,
			name: "Nourriture festival",
			amount: 138.0,
			isAmountCalculated: false,
			date: "2025-06-21",
			payerId: pThomas.id,
			categoryId: restaurants.id,
			split: [
				{ participantId: pDemo.id, amount: 46.0, isCalculated: true },
				{ participantId: pJerem.id, amount: 46.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 46.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectFestival.id, appUserId: demo.id });
	}

	console.log("✅ project 6 seeded — Festival été 2025 (archivé, Autre)");

	// ============================================================
	// PROJECT 7 — Road trip Bretagne (demo)
	// Cas : balance greedy complexe — 4 participants, répartitions asymétriques
	// → algo devrait produire n-1 = 3 transactions
	// Type : Voyage ✅
	// ============================================================

	const projectBretagne = await prisma.project.upsert({
		where: { id: 7 },
		update: {},
		create: {
			name: "Road trip Bretagne",
			description: "10 jours sur les côtes bretonnes",
			type: ProjectType.Voyage,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pSophie.id, pMarco.id, pLea.id]) {
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

	// Répartitions intentionnellement asymétriques pour forcer un greedy non-trivial :
	// Demo paie beaucoup, Sophie peu, Marco & Léa dépenses intermédiaires
	for (const op of [
		{
			id: 60,
			name: "Location voiture",
			amount: 320.0,
			isAmountCalculated: false,
			date: "2026-07-01",
			payerId: pDemo.id,
			categoryId: transport.id,
			split: [
				{ participantId: pDemo.id, amount: 80.0, isCalculated: true },
				{ participantId: pSophie.id, amount: 80.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 80.0, isCalculated: true },
				{ participantId: pLea.id, amount: 80.0, isCalculated: true },
			],
		},
		{
			id: 61,
			name: "Camping 5 nuits",
			amount: 240.0,
			isAmountCalculated: false,
			date: "2026-07-02",
			// Marco paie mais Léa n'y participe pas (elle dort en Airbnb séparément)
			payerId: pMarco.id,
			categoryId: hebergement.id,
			split: [
				{ participantId: pDemo.id, amount: 80.0, isCalculated: false },
				{ participantId: pSophie.id, amount: 80.0, isCalculated: false },
				{ participantId: pMarco.id, amount: 80.0, isCalculated: false },
			],
		},
		{
			id: 62,
			name: "Airbnb Léa",
			amount: 150.0,
			isAmountCalculated: false,
			date: "2026-07-02",
			payerId: pLea.id,
			categoryId: hebergement.id,
			// Léa paie et supporte seule le coût
			split: [
				{ participantId: pLea.id, amount: 150.0, isCalculated: false },
			],
		},
		{
			id: 63,
			name: "Restaurants divers",
			amount: 200.0,
			isAmountCalculated: false,
			date: "2026-07-04",
			payerId: pSophie.id,
			categoryId: restaurants.id,
			split: [
				{ participantId: pDemo.id, amount: 50.0, isCalculated: true },
				{ participantId: pSophie.id, amount: 50.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 50.0, isCalculated: true },
				{ participantId: pLea.id, amount: 50.0, isCalculated: true },
			],
		},
		{
			id: 64,
			name: "Carburant",
			amount: 98.5,
			isAmountCalculated: false,
			date: "2026-07-03",
			payerId: pDemo.id,
			categoryId: transport.id,
			split: [
				{ participantId: pDemo.id, amount: 24.63, isCalculated: true },
				{ participantId: pSophie.id, amount: 24.62, isCalculated: true },
				{ participantId: pMarco.id, amount: 24.62, isCalculated: true },
				{ participantId: pLea.id, amount: 24.63, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectBretagne.id, appUserId: demo.id });
	}

	console.log("✅ project 7 seeded — Road trip Bretagne (greedy complexe, 4 participants)");

	// ============================================================
	// PROJECT 8 — Réno appart (demo)
	// Cas : 2 participants, budget élevé très peu consommé
	// Type : Maison_Coloc ✅ (bis, pour couvrir le type avec un 2e projet)
	// ============================================================

	const projectReno = await prisma.project.upsert({
		where: { id: 8 },
		update: {},
		create: {
			name: "Réno appart Demo",
			description: "Travaux de rénovation de l'appartement",
			type: ProjectType.Maison_Coloc,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pMarco.id]) {
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
			id: 70,
			name: "Peinture salon",
			amount: 280.0,
			isAmountCalculated: false,
			date: "2026-02-10",
			payerId: pDemo.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 140.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 140.0, isCalculated: true },
			],
		},
		{
			id: 71,
			name: "Parquet chambre",
			amount: 1200.0,
			isAmountCalculated: false,
			date: "2026-02-15",
			payerId: pMarco.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 600.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 600.0, isCalculated: true },
			],
		},
		{
			id: 72,
			name: "Électricien",
			amount: 450.0,
			isAmountCalculated: false,
			date: "2026-03-01",
			payerId: pDemo.id,
			categoryId: divers.id,
			split: [
				{ participantId: pDemo.id, amount: 225.0, isCalculated: true },
				{ participantId: pMarco.id, amount: 225.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectReno.id, appUserId: demo.id });
	}

	console.log("✅ project 8 seeded — Réno appart (2 participants, budget peu consommé)");

	// ============================================================
	// PROJECT 9 — Cuisine du monde (demo)
	// Cas : plusieurs opérations sur différentes catégories → test du filtre catégorie Overview
	// Pas de budget
	// Type : Repas_Sortie ✅ (bis)
	// ============================================================

	const projectCuisine = await prisma.project.upsert({
		where: { id: 9 },
		update: {},
		create: {
			name: "Cuisine du monde",
			description: "Soirées thématiques cuisine entre amis",
			type: ProjectType.Repas_Sortie,
			appUserId: demo.id,
		},
	});

	for (const participantId of [pDemo.id, pAurore.id, pLea.id, pSophie.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectCuisine.id, participantId } },
			update: {},
			create: { projectId: projectCuisine.id, participantId },
		});
	}

	for (const op of [
		{
			id: 80,
			name: "Soirée japonaise",
			amount: 67.3,
			isAmountCalculated: false,
			date: "2026-03-15",
			payerId: pAurore.id,
			categoryId: courses.id,
			split: [
				{ participantId: pDemo.id, amount: 16.83, isCalculated: true },
				{ participantId: pAurore.id, amount: 16.82, isCalculated: true },
				{ participantId: pLea.id, amount: 16.82, isCalculated: true },
				{ participantId: pSophie.id, amount: 16.83, isCalculated: true },
			],
		},
		{
			id: 81,
			name: "Soirée mexicaine",
			amount: 54.9,
			isAmountCalculated: false,
			date: "2026-04-05",
			payerId: pDemo.id,
			categoryId: courses.id,
			split: [
				{ participantId: pDemo.id, amount: 13.73, isCalculated: true },
				{ participantId: pAurore.id, amount: 13.72, isCalculated: true },
				{ participantId: pLea.id, amount: 13.72, isCalculated: true },
				{ participantId: pSophie.id, amount: 13.73, isCalculated: true },
			],
		},
		{
			id: 82,
			name: "Soirée indienne",
			amount: 71.0,
			isAmountCalculated: false,
			date: "2026-05-03",
			payerId: pLea.id,
			categoryId: courses.id,
			split: [
				{ participantId: pDemo.id, amount: 17.75, isCalculated: true },
				{ participantId: pAurore.id, amount: 17.75, isCalculated: true },
				{ participantId: pLea.id, amount: 17.75, isCalculated: true },
				{ participantId: pSophie.id, amount: 17.75, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectCuisine.id, appUserId: demo.id });
	}

	console.log("✅ project 9 seeded — Cuisine du monde (filtre catégorie, sans budget)");

	// ============================================================
	// PROJECT 10 — Voyage Milan (steve)
	// Cas : même type que le projet 1 mais appartenant à steve
	// → teste la séparation de projets par utilisateur
	// Type : Voyage ✅
	// ============================================================

	const projectMilanSteve = await prisma.project.upsert({
		where: { id: 10 },
		update: {},
		create: {
			name: "Week-end Paris",
			description: "Séjour à Paris — compte steve",
			type: ProjectType.Voyage,
			appUserId: steve.id,
		},
	});

	for (const participantId of [pSteve.id, pAurore.id, pLudo.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectMilanSteve.id, participantId } },
			update: {},
			create: { projectId: projectMilanSteve.id, participantId },
		});
	}

	await prisma.budget.upsert({
		where: { projectId: projectMilanSteve.id },
		update: {},
		create: { amount: 600.0, limitCriteria: 80.0, projectId: projectMilanSteve.id },
	});

	for (const op of [
		{
			id: 90,
			name: "Train aller-retour",
			amount: 180.0,
			isAmountCalculated: false,
			date: "2026-05-21",
			payerId: pSteve.id,
			categoryId: transport.id,
			split: [
				{ participantId: pSteve.id, amount: 60.0, isCalculated: true },
				{ participantId: pAurore.id, amount: 60.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 60.0, isCalculated: true },
			],
		},
		{
			id: 91,
			name: "Hôtel Paris",
			amount: 240.0,
			isAmountCalculated: false,
			date: "2026-05-21",
			payerId: pAurore.id,
			categoryId: hebergement.id,
			split: [
				{ participantId: pSteve.id, amount: 80.0, isCalculated: true },
				{ participantId: pAurore.id, amount: 80.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 80.0, isCalculated: true },
			],
		},
		{
			id: 92,
			name: "Restos et sorties",
			amount: 135.0,
			isAmountCalculated: false,
			date: "2026-05-22",
			payerId: pLudo.id,
			categoryId: restaurants.id,
			split: [
				{ participantId: pSteve.id, amount: 45.0, isCalculated: true },
				{ participantId: pAurore.id, amount: 45.0, isCalculated: true },
				{ participantId: pLudo.id, amount: 45.0, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectMilanSteve.id, appUserId: steve.id });
	}

	console.log("✅ project 10 seeded — Week-end Paris (steve)");

	// ============================================================
	// PROJECT 11 — Coloc Aurore (aurore)
	// Tests séparation de comptes : aurore a ses propres projets
	// Cas : alerte unread sur le compte aurore
	// Type : Maison_Coloc ✅
	// ============================================================

	const projectColocAurore = await prisma.project.upsert({
		where: { id: 11 },
		update: {},
		create: {
			name: "Coloc bd Voltaire",
			description: "Charges communes de la coloc d'Aurore",
			type: ProjectType.Maison_Coloc,
			appUserId: aurore.id,
		},
	});

	for (const participantId of [pAurore.id, pSophie.id, pThomas.id]) {
		await prisma.projectParticipant.upsert({
			where: { projectId_participantId: { projectId: projectColocAurore.id, participantId } },
			update: {},
			create: { projectId: projectColocAurore.id, participantId },
		});
	}

	const budgetColocAurore = await prisma.budget.upsert({
		where: { projectId: projectColocAurore.id },
		update: {},
		create: { amount: 1500.0, limitCriteria: 80.0, projectId: projectColocAurore.id },
	});

	for (const op of [
		{
			id: 100,
			name: "Loyer mai",
			amount: 900.0,
			isAmountCalculated: false,
			date: "2026-05-01",
			payerId: pAurore.id,
			categoryId: divers.id,
			split: [
				{ participantId: pAurore.id, amount: 300.0, isCalculated: true },
				{ participantId: pSophie.id, amount: 300.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 300.0, isCalculated: true },
			],
		},
		{
			id: 101,
			name: "EDF mai",
			amount: 78.0,
			isAmountCalculated: false,
			date: "2026-05-10",
			payerId: pSophie.id,
			categoryId: divers.id,
			split: [
				{ participantId: pAurore.id, amount: 26.0, isCalculated: true },
				{ participantId: pSophie.id, amount: 26.0, isCalculated: true },
				{ participantId: pThomas.id, amount: 26.0, isCalculated: true },
			],
		},
		{
			id: 102,
			name: "Courses communes",
			amount: 245.0,
			isAmountCalculated: false,
			date: "2026-05-15",
			payerId: pThomas.id,
			categoryId: courses.id,
			split: [
				{ participantId: pAurore.id, amount: 81.67, isCalculated: true },
				{ participantId: pSophie.id, amount: 81.67, isCalculated: true },
				{ participantId: pThomas.id, amount: 81.66, isCalculated: true },
			],
		},
	]) {
		await seedOperation({ ...op, projectId: projectColocAurore.id, appUserId: aurore.id });
	}

	// Alerte unread → 1223 € > 80 % de 1500 € (= 1200 €)
	await seedAlert({
		id: 4,
		status: "unread",
		message: "Le budget de Coloc bd Voltaire a dépassé 80 % du montant prévu (1 223,00 € sur 1 500,00 €).",
		budgetId: budgetColocAurore.id,
		appUserIds: [aurore.id],
	});

	console.log("✅ project 11 seeded — Coloc bd Voltaire (aurore, alerte unread)");

	// ============================================================
	// RÉSUMÉ DES CAS COUVERTS
	// ============================================================
	//
	// ✅ Tous les ProjectType : Voyage, Maison_Coloc, Anniversaire, Repas_Sortie, Pro_Travail, Autre
	// ✅ Projet archivé (isArchived: true) → project 6
	// ✅ Projet sans budget → projects 4, 6, 9
	// ✅ Alerte unread → projects 1, 11
	// ✅ Alerte read (historique) → project 2
	// ✅ Alerte resolved → project 3
	// ✅ Pas d'alerte → projects 5, 7, 8, 10
	// ✅ Payeur absent de sa propre répartition → project 1 op 2 (Sophie)
	// ✅ Répartition inégale (parts custom) → project 3 op 1 (Location salle)
	// ✅ Participant seul dans sa répartition → project 7 op 3 (Léa, Airbnb)
	// ✅ Balances nulles (tout équilibré) → project 4 (Raclette)
	// ✅ Greedy 3 participants → project 1
	// ✅ Greedy 4 participants complexe → project 7
	// ✅ Multi-utilisateurs (demo, steve, aurore) avec projets séparés
	// ✅ Participants avec compte (5) et sans compte (4)
	// ✅ Compte démo prêt pour la présentation jury (email: demo@lapince.fr, mdp: demo1234)
	//
	// ============================================================

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