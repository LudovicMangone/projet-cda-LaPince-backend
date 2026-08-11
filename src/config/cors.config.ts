export const allowedOrigins =
	process.env.NODE_ENV === "production"
		? ["https://projet-cda-la-pince-frontend.vercel.app"]
		: ["http://localhost:5173"];
