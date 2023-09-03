import { NextFunction, Request, Response } from 'express'
import { HttpError, ServerError, UnauthorizedError } from './utility/http-error'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { SampleService } from './modules/sample/sample.service'
import { generateToken, verifyToken } from './utility/auth'
import { isToken } from './data/token'
import { RedisRepo } from './data-source'
import { isHashed } from './data/hashed'
import { UserService } from './modules/user/bll/user.service'

export const authMiddleware = (userService: UserService) => async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.header('Authorization')?.replace('Bearer ', '')
    const refreshToken = req.header('refresh')?.replace('Bearer ', '')
    if (isHashed(refreshToken)) RedisRepo.setNewExpire(refreshToken)
    if (!isToken(accessToken)) return res.status(401).send({ error: 'شما اجازه دسترسی ندارید.' })
    const authedUser = verifyToken(accessToken)

    if (authedUser instanceof HttpError) {
        res.status(authedUser.status).send({ error: authedUser.message })
        return
    }

    if (authedUser instanceof TokenExpiredError) {
        if (!isHashed(refreshToken)) return res.status(401).send({ error: 'شما اجازه دسترسی ندارید.' })
        const userId = await RedisRepo.getUserId(refreshToken)
        if (!userId) return res.status(401).send({ error: 'شما اجازه دسترسی ندارید.' })
        const userBasic = await userService.getUserBasicById(userId)
        if (!userBasic) return res.status(401).send({ error: 'شما اجازه دسترسی ندارید.' })
        const newToken = generateToken(userBasic)
        if (newToken instanceof ServerError) return res.status(newToken.status).send({ error: newToken.message })
        res.header('Authorization', newToken)
        req.user = userBasic
        next()
        return
    }

    req.user = authedUser

    next()
}
