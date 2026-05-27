import express from "express";
import { notFound } from "./middlewares/notFound.middleware";

const app = express();

app.get("/", (_req, res) => {
	res.send("Hello World");
});

app.use(notFound);

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
