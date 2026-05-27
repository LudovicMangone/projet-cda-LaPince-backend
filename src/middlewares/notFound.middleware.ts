// Importing our custom error library
import { NotFoundError } from "../lib/errors";

export function notFound() {
	throw new NotFoundError("Resource not found");
}
