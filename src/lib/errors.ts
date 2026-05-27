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

// Generals errors :
export class NotFoundError extends HttpError {
	constructor(message: string) {
		super(message, { status: 404 });
	}
}

export class BadRequestError extends HttpError {
	constructor(message: string) {
		super(message, { status: 400 });
	}
}

export class UnauthorizedError extends HttpError {
	constructor(message: string) {
		super(message, { status: 401 });
	}
}

export class ForbiddenError extends HttpError {
	constructor(message: string) {
		super(message, { status: 403 });
	}
}

export class ConflictError extends HttpError {
	constructor(message: string) {
		super(message, { status: 409 });
	}
}

// Too many attempts of request :
export class TooManyRequestsError extends HttpError {
	constructor(message: string) {
		super(message, { status: 429 });
	}
}
