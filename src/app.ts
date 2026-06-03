import cors from "cors";
import express from "express";
import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
import { allowedOrigins } from "./config/cors.config";
import { envConfig } from "./config/env.config";
import { apiRateLimiter } from "./lib/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import authRouter from "./routers/auth.router";
import categoriesRouter from "./routers/categories.router";
import projectsRouter from "./routers/projects.router";

// ============== SETTINGS ==================
export const app = express(); // CORS: allows external clients (frontend, tools, other APIs) to call the API
app.set("trust proxy", 1); // Required for Render/reverse proxy
app.use(cors({ origin: allowedOrigins }));
// XSS sanitizer: protects against malicious scripts injected in user input
app.use(xss());
// Standard headers reforced, hidden infos and XSS attack blocker
app.use(helmet());
// Parses JSON request bodies: required to read req.body in POST / PATCH / PUT requests. Using a limit for payload attac
app.use(express.json({ limit: envConfig.jsonLimit }));
// Rate limiter to protect the API against abuse and excessive requests (basic DDoS / brute-force protection)
app.use(apiRateLimiter);

// ============== ROUTES ====================
app.get("/", (_req, res) => {
	res.send("Hello World");
});
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/categories", categoriesRouter);

// ============== ERRORS HANDLERS ===========
app.use(notFoundHandler);
app.use(errorHandler);

// ============== LISTENER ==================

app.listen(envConfig.port, () => {
	console.log(`Server is running on http://localhost:${envConfig.port}`);
});
