import type { NextFunction, Request, Response } from "express";
import {
	updateProjectParticipantsSchema,
	updateProjectSchema,
} from "../schemas/project.schema";

export function validateProjectUpdate(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		updateProjectSchema.parse(req.body);
		next();
	} catch (error) {
		next(error);
	}
}
export function validateProjectParticipantsUpdate(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		updateProjectParticipantsSchema.parse(req.body);
		next();
	} catch (error) {
		next(error);
	}
}
