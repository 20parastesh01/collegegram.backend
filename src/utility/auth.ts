import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { Token, isToken } from '../data/token'
import { ServerError, UnauthorizedError } from './http-error'
import bcrypt, { hash } from 'bcryptjs'
import { Hashed, isHashed } from '../data/hashed'
import { UserId, isUserId } from '../modules/user/model/user-id'
import { Username, isUsername } from '../modules/user/model/username'
import { InputPassword } from '../modules/user/model/inputpassword'
import { UserBasic } from '../modules/user/model/user'

const isJwtPayload = (payload: unknown): payload is UserBasic => {
    return payload !== null && typeof payload == 'object' && 'userId' in payload && 'username' in payload && isUserId(payload.userId) && isUsername(payload.username)
}

const SECRET_KEY = process.env.SECRET_KEY!

export const generateToken = (data: UserBasic): Token | ServerError => {
    const token = jwt.sign(data, SECRET_KEY, { expiresIn: '6h' })
    if (isToken(token)) return token
    return new ServerError('Token Generation Failed')
}

export const verifyToken = (token: Token): UserBasic | UnauthorizedError | ServerError => {
    try {
        const payload = jwt.verify(token, SECRET_KEY)
        if (isJwtPayload(payload)) return payload
        return new UnauthorizedError('Invalid Token')
    } catch (e) {
        if (e instanceof JsonWebTokenError) return new UnauthorizedError('Invalid Token')
        return new ServerError('verifyToken')
    }
}

export const createSession = async (id: UserId): Promise<ServerError | Hashed> => {
    const session = await bcrypt.hash(id + '', 8)
    if (isHashed(session)) return session
    return new ServerError('createSession')
}

export const compareHash = async (plain: string, hashed: Hashed): Promise<boolean> => {
    const isMatch = await bcrypt.compare(plain, hashed)
    return isMatch
}
