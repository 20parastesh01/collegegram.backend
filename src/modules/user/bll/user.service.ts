import { QueryFailedError } from 'typeorm'
import { BadRequestError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { SignUpDto } from '../dto/signup.dto'
import { User, UserWithToken } from '../model/user'
import { IUserRepository, UserRepository } from '../user.repository'
import bcrypt from 'bcryptjs'
import { Password, isPassword } from '../model/password'
import { compareHash, createSession, generateToken } from '../../../utility/auth'
import { Hashed } from '../../../data/hashed'
import { Token } from '../../../data/token'
import { UserEntity } from '../entity/user.entity'
import { RedisRepo } from '../../../data-source'
import { Service } from '../../../registry'
import { LoginDto } from '../dto/login.dto'
import { BRAND } from 'zod'
import { Email, isEmail } from '../../../data/email'
import { Username, isUsername } from '../model/username'
import { userEntitytoUser } from './user.dao'

type LoginSignUp = UserWithToken | BadRequestError | ServerError

export interface IUserService {
    signup(data: SignUpDto): Promise<LoginSignUp>
    login(data: LoginDto): Promise<LoginSignUp>
}

export const hash = async (input: string): Promise<Password> => {
    const hashed = await bcrypt.hash(input, 8)
    if (isPassword(hashed)) {
        return hashed
    }
    throw new ServerError('Hashing Went Wrong')
}

@Service(UserRepository)
export class UserService implements IUserService {
    constructor(private userRepo: IUserRepository) {}
    async login(data: LoginDto): Promise<LoginSignUp | UnauthorizedError> {
        const usernameOrEmail = data.usernameOrEmail
        const password = data.password
        let userEntity: UserEntity | null = null
        if (isUsername(usernameOrEmail)) {
            userEntity = await this.userRepo.findByUsername(usernameOrEmail)
        }
        if (isEmail(usernameOrEmail)) {
            userEntity = await this.userRepo.findByEmail(usernameOrEmail)
        }
        if (!userEntity) {
            return new UnauthorizedError('Username or Email is Invalid')
        }
        const isMatchPassword = await compareHash(password, userEntity.password)
        if (!isMatchPassword) {
            return new UnauthorizedError('Invalid Password')
        }
        const accessToken = generateToken({
            userId: userEntity.id,
            username: userEntity.username,
        })
        if (accessToken instanceof ServerError) return accessToken

        let refreshToken = await RedisRepo.getSession(userEntity.id)
        if (!refreshToken) {
            const newRefreshToken = await createSession(userEntity.id)
            if (newRefreshToken instanceof ServerError) return newRefreshToken

            await RedisRepo.setSession(newRefreshToken, userEntity.id)
            refreshToken = newRefreshToken
        }

        const user = userEntitytoUser(userEntity)

        return { user, accessToken, refreshToken }
    }
    async signup(data: SignUpDto): Promise<LoginSignUp> {
        try {
            const password = await hash(data.password)
            const user = await this.userRepo.create({
                username: data.username,
                email: data.email,
                password,
                name: '',
                lastname: '',
                photo: '',
                bio: '',
            })
            const accessToken = generateToken({
                userId: user.id,
                username: user.username,
            })
            if (accessToken instanceof ServerError) return accessToken

            const refreshToken = await createSession(user.id)
            if (refreshToken instanceof ServerError) return refreshToken

            await RedisRepo.setSession(refreshToken, user.id)

            const result = { user, accessToken, refreshToken }
            return result
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return new BadRequestError(e.driverError)
            }
            console.log(e)
            return new ServerError('signup')
        }
    }
}
