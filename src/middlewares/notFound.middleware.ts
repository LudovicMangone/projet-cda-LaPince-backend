// Importing our custom error library
import { NotFoundError } from "../lib/errors";

export function notFoundHandler() {
	throw new NotFoundError("404 - Resource not found");
}
