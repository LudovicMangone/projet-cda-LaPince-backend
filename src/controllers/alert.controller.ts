import type { Request, Response } from "express";
import { ZodError } from "zod";
import { BadRequestError } from "../lib/errors";
import { updateAlertSchema } from "../schemas/alert.schema";
import { getAlertsByUser, markAlertAsRead } from "../services/alert.service";

// GET /api/alertes
// Retourne toutes les alertes de l'utilisateur connecté
export async function getAlertsController(req: Request, res: Response) {
	const userId = req.userId;

	const alerts = await getAlertsByUser(userId);

	res.json({ alerts });
}

// PATCH /api/alertes/:alerteId
// Marque une alerte comme lue ou non lue
export async function updateAlertController(req: Request, res: Response) {
	const userId = req.userId;
	const alertId = Number(req.params.alerteId);

	try {
		const data = updateAlertSchema.parse(req.body);
		const updated = await markAlertAsRead(alertId, userId, data);
		res.json({ alert: updated });
	} catch (error) {
		if (error instanceof ZodError) {
			throw new BadRequestError(error.issues[0].message);
		}
		throw error;
	}
}