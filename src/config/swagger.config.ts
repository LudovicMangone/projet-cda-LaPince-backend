import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "La Pince API",
			version: "1.0.0",
			description: "Documentation interactive de l'API REST La Pince",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Serveur de développement",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: ["./src/docs/*.yml"],// swagger-jsdoc va lire les fichiers .yml
} 

export const swaggerSpec = swaggerJsdoc(options);