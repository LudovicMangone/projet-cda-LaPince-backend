import z from "zod";
import type { Request, Response, NextFunction } from "express";
// Importing our custom error library
import { HttpError } from "../lib/errors";

// Two ways of using it :
// - in an upstream controller, use `next(error)`
// - since Express 5, simply throwing an error inside an async controller will forward the error here

//TODO : add logger.info for each case if later a logger is setup on the project

export function errorHandler(
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	// If an error from zod validation happen :
	if (error instanceof z.ZodError) {
		console.info("ZodError", error);

		return res.status(422).json({
			status: 400,
			error: z.prettifyError(error),
		});
	}

	// Controlled errors: those who voluntarily throw
	if (error instanceof HttpError) {
		return res.status(error.status).json({
			status: error.status,
			error: error.message,
		});
	}

	// If it's an unexpected error, it throw a generic one :
	res.status(500).json({
		status: 500,
		error: "Internal server error",
	});
}
