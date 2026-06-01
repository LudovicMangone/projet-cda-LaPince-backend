export const allowedOrigins =
	process.env.NODE_ENV === "production"
		? ["https://lapince-frontend.vercel.app"]
		: ["http://localhost:5173"];
