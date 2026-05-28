import express from "express";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import authRouter from "./routers/auth.router";

export const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});


