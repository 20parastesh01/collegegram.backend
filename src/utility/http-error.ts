export class HttpError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message)
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'دسترسی ممنوع است') {
        super(403, message)
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'درخواست پیدا نشد.') {
        super(404, message)
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'اجازه دسترسی به این منبع وجود ندارد.') {
        super(401, message)
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'درخواست نامعتبر است.') {
        super(401, message)
    }
}

export class ServerError extends HttpError {
    constructor(message = 'خطای سرور رخ داده است.') {
        super(500, message)
    }
}
