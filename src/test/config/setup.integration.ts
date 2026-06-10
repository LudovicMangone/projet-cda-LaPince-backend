// Override DATABASE_URL before dotenv loads .env (dotenv does not override existing env vars)
// This ensures Prisma connects to localhost instead of the Docker service name
process.env.DATABASE_URL =
	"postgresql://lapince_user:lapince_password@localhost:5432/lapince_db";
