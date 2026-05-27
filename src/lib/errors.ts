// Extends the native JavaScript Error class with err.message, err.stack and err.name properties
export class HttpError extends Error {
	status: number;
	name;

	constructor(message: string, { status }: { status: number }) {
		super(message);
		this.name = this.constructor.name;
		this.status = status;
	}
}

export class NotFoundError extends HttpError {
	constructor(message: string) {
		super(message, { status: 404 });
	}
}
