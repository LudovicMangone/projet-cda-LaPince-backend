import type { Prisma } from "../../generated/prisma";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type { UpdateAlertInput } from "../schemas/alert.schema";

// Récupère toutes les alertes de l'utilisateur connecté, les plus récentes en premier
export async function getAlertsByUser(userId: number) {
	const userAlerts = await prisma.appUserAlert.findMany({
		where: { appUserId: userId },
		include: {
			alert: {
				include: {
					budget: {
						select: {
							amount: true,
							project: {
								select: { name: true },
							},
						},
					},
				},
			},
		},
		orderBy: { alert: { createdAt: "desc" } },
	});

	return userAlerts.map((ua) => ({
		id: ua.alert.id,
		status: ua.alert.status,
		message: ua.alert.message,
		budgetId: ua.alert.budgetId,
		budgetAmount: Number(ua.alert.budget.amount),
		projectName: ua.alert.budget.project.name,
		createdAt: ua.alert.createdAt,
	}));
}

// Marque une alerte comme lue ou non lue
// Vérifie que l'alerte appartient bien à l'utilisateur avant de modifier
export async function markAlertAsRead(
	alertId: number,
	userId: number,
	data: UpdateAlertInput,
) {
	// Vérification d'accès : l'alerte doit appartenir à cet utilisateur
	const userAlert = await prisma.appUserAlert.findUnique({
		where: {
			appUserId_alertId: {
				appUserId: userId,
				alertId,
			},
		},
	});

	if (!userAlert) {
		throw new NotFoundError("Alerte introuvable");
	}

	const updated = await prisma.alert.update({
		where: { id: alertId },
		data: { status: data.status },
		select: {
			id: true,
			status: true,
			message: true,
			budgetId: true,
			createdAt: true,
		},
	});

	return updated;
}

// Vérifie si le seuil d'alerte est dépassé après une mutation d'opération.
// Si oui, crée une alerte et la lie à l'utilisateur propriétaire du projet.
// Appelée dans une transaction existante (tx) depuis operations.service.ts
export async function checkAndCreateAlert(
	projectId: number,
	userId: number,
	tx: Prisma.TransactionClient,
) {
	// Récupère le budget et son seuil d'alerte
	const budget = await tx.budget.findUnique({
		where: { projectId },
		select: {
			id: true,
			amount: true,
			limitCriteria: true,
		},
	});

	// Pas de budget défini sur ce projet : rien à vérifier
	if (!budget) return;

	// Calcule le total des dépenses actuelles du projet
	const aggregate = await tx.operation.aggregate({
		where: { projectId },
		_sum: { amount: true },
	});

	const totalSpent = Number(aggregate._sum.amount ?? 0);
	const budgetAmount = Number(budget.amount);
	const threshold = Number(budget.limitCriteria);

	// Seuil non atteint : rien à faire
	if (totalSpent < (budgetAmount * threshold) / 100) return;

	// Évite les doublons : ne crée pas d'alerte si une alerte non lue existe déjà pour ce budget
	const existingAlert = await tx.appUserAlert.findFirst({
		where: {
			appUserId: userId,
			alert: {
				budgetId: budget.id,
				status: { in: ["unread", "read"] },
			},
		},
	});

	if (existingAlert) return;

	// Crée l'alerte et la lie à l'utilisateur dans la même transaction
	const alert = await tx.alert.create({
		data: {
			message: `Le budget du projet a dépassé ${threshold} % du montant prévu — ${totalSpent.toFixed(2)} € sur ${budgetAmount.toFixed(2)} €.`,
			budgetId: budget.id,
			appUserAlerts: {
				create: { appUserId: userId },
			},
		},
	});

	return alert;
}
