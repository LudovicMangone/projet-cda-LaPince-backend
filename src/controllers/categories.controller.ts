import type { Request, Response } from "express";
import { getCategories } from "../services/categories.service";

export async function getCategoriesController(_req: Request, res: Response) {
	const categories = await getCategories();

	return res.status(200).json({ categories });
}
