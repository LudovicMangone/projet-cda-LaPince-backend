import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { BadRequestError } from "../lib/errors";
import { updateProjectSchema } from "../schemas/project.schema";

export function validateProjectUpdate(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	try {
		updateProjectSchema.parse(req.body);
		next();
	} catch (error) {
		if (error instanceof ZodError) {
			throw new BadRequestError(error.issues[0].message);
		}
		next(error);
	}
}
