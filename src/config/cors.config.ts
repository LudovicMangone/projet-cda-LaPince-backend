// TODO: replace with the real frontend domain in production

export const allowedOrigins =
	process.env.NODE_ENV === "production"
		? ["https://our.futur.domain.name"]
		: ["http://localhost:5173"];
