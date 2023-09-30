import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { Token, isToken } from '../data/token'
import { ServerError, UnauthorizedError } from './http-error'
import bcrypt, { hash } from 'bcryptjs'
import { Hashed, isHashed } from '../data/hashed'
import { UserId, isUserId } from '../modules/user/model/user-id'
import { Username, isUsername } from '../modules/user/model/username'
import { InputPassword } from '../modules/user/model/inputpassword'
import { UserBasic, isUserBasic } from '../modules/user/model/user'
import { PersianErrors } from './persian-messages'

const SECRET_KEY = process.env.SECRET_KEY!

export const generateToken = (data: UserBasic): Token | ServerError => {
    const token = jwt.sign(data, SECRET_KEY, { expiresIn: 7200 })
    if (isToken(token)) return token
    return new ServerError()
}

export const verifyToken = (token: Token): UserBasic | UnauthorizedError | ServerError | TokenExpiredError => {
    try {
        const payload = jwt.verify(token, SECRET_KEY)
        if (isUserBasic(payload)) return payload
        return new UnauthorizedError(PersianErrors.InvalidToken)
    } catch (e) {
        if (e instanceof TokenExpiredError) return e
        if (e instanceof JsonWebTokenError) return new UnauthorizedError(PersianErrors.InvalidToken)
        return new ServerError()
    }
}

export const createSession = async (id: UserId): Promise<ServerError | Hashed> => {
    const session = await bcrypt.hash(id + '', 8)
    if (isHashed(session)) return session
    return new ServerError()
}

export const compareHash = async (plain: string, hashed: Hashed): Promise<boolean> => {
    const isMatch = await bcrypt.compare(plain, hashed)
    return isMatch
}
