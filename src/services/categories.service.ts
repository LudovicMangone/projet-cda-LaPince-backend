import { NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getCategories() {
	const categories = await prisma.category.findMany({
		select: {
			id: true,
			name: true,
			color: true,
		},
	});

	if (!categories) {
		throw new NotFoundError("no categories found");
	}
	return categories;
}
