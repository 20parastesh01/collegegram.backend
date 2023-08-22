export class HttpError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message)
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(403, message)
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
        super(404, message)
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(401, message)
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'Bad Request') {
        super(401, message)
    }
}

export class ServerError extends HttpError {
    constructor(message = 'Server Error') {
        super(500, message)
    }
}
