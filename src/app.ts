import express from "express";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";

const app = express();

app.get("/", (_req, res) => {
	res.send("Hello World");
});

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
