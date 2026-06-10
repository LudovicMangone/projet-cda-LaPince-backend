// Production entry point — imports the configured Express app and starts listening.
// Kept separate from app.ts so that tests can import app without triggering a listen() call.
import { app } from "./app";
import { envConfig } from "./config/env.config";

app.listen(envConfig.port, () => {
	console.log(`Server is running on http://localhost:${envConfig.port}`);
});
