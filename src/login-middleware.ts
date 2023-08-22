import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from './utility/http-error'
import jwt from 'jsonwebtoken'
import { SampleService } from './modules/sample/sample.service'

export const loginMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
    next()
}
