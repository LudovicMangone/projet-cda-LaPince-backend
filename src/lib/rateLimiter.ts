import rateLimit from "express-rate-limit";
import { envConfig } from "../config/env.config";
import { TooManyRequestsError } from "./errors";

export const apiRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes before re initalisation of the limiter
	max: envConfig.rateLimitMax,

	standardHeaders: true,
	legacyHeaders: false,

	handler: (_req, _res, next) => {
		next(
			new TooManyRequestsError(
				"429 - Too many requests, try again in 15 minutes",
			),
		);
	},
});
