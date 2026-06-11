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
	// Parse and overwrite req.body so Zod transforms and stripping reach the controller
	req.body = updateProjectSchema.parse(req.body);
	next();
}
export function validateProjectParticipantsUpdate(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	// Parse and overwrite req.body so Zod transforms and stripping reach the controller
	req.body = updateProjectParticipantsSchema.parse(req.body);
	next();
}
