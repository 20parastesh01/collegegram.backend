import { NextFunction, Request, Response } from 'express'
import { HttpError, UnauthorizedError } from './utility/http-error'
import jwt from 'jsonwebtoken'
import { SampleService } from './modules/sample/sample.service'
import { verifyToken } from './utility/auth'
import { isToken } from './data/token'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.header('Authorization')?.replace('Bearer ', '')
    if (!isToken(accessToken)) return res.status(401).send({ error: 'Unauthorized' })
    const authedUser = verifyToken(accessToken)

    if (authedUser instanceof HttpError) {
        res.status(authedUser.status).send({ error: authedUser.message })
        return
    }

    req.user = authedUser

    next()
}
