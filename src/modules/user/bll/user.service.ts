import bcrypt from 'bcryptjs'
import { QueryFailedError } from 'typeorm'
import { v4 } from 'uuid'
import { MinioRepo, RedisRepo } from '../../../data-source'
import { isEmail } from '../../../data/email'
import { SimpleMessage } from '../../../data/simple-message'
import { compareHash, createSession, generateToken } from '../../../utility/auth'
import { BadRequestError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { sendEmail } from '../../../utility/send-email'
import { LoginDto } from '../dto/login.dto'
import { SendEmailDto } from '../dto/send-email.dto'
import { SetPasswordDto } from '../dto/set-pass.dto'
import { SignUpDto } from '../dto/signup.dto'
import { UserEntity } from '../entity/user.entity'
import { Password, isPassword } from '../model/password'
import { User, UserBasic, UserWithToken } from '../model/user'
import { UserId } from '../model/user-id'
import { isUsername } from '../model/username'
import { EditUser, IUserRepository, UserRepository } from '../user.repository'
import { userEntitytoUser, userEntitytoUserBasic, usertoUserBasic } from './user.dao'
import { Service } from '../../../registry/layer-decorators'
import { EditProfileDto } from '../dto/edit-profile.dto'
import { Token } from '../../../data/token'

export type LoginSignUp = UserWithToken | BadRequestError | ServerError

export interface IUserService {
    signup(data: SignUpDto): Promise<LoginSignUp>
    login(data: LoginDto): Promise<LoginSignUp>
    getUserById(userId: UserId): Promise<User | null>
    forgetPassSendEmail(data: SendEmailDto): Promise<SimpleMessage | BadRequestError>
    forgetPassSetPass(data: SetPasswordDto): Promise<LoginSignUp>
    editProfile(user: UserBasic, data: EditProfileDto, file?: Express.Multer.File): Promise<{ user: User, token: Token } | ServerError>
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
    constructor(private userRepo: IUserRepository) { }

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
        const accessToken = generateToken(userEntitytoUserBasic(userEntity))
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
            const userEntity = await this.userRepo.create({
                username: data.username,
                email: data.email,
                password,
                name: '',
                lastname: '',
                photo: '',
                bio: '',
            })
            const accessToken = generateToken(userEntitytoUserBasic(userEntity))
            if (accessToken instanceof ServerError) return accessToken

            const refreshToken = await createSession(userEntity.id)
            if (refreshToken instanceof ServerError) return refreshToken

            await RedisRepo.setSession(refreshToken, userEntity.id)

            const result = { user: userEntitytoUser(userEntity), accessToken, refreshToken }
            return result
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return new BadRequestError(e.driverError)
            }
            console.log(e)
            return new ServerError('signup')
        }
    }

    async getUserById(userId: UserId): Promise<User | null> {
        const userEntity = await this.userRepo.findById(userId)
        if (!userEntity) return null
        const user = userEntitytoUser(userEntity)
        return user
    }

    async forgetPassSendEmail(data: SendEmailDto): Promise<SimpleMessage | BadRequestError> {
        const usernameOrEmail = data.usernameOrEmail
        let userEntity: UserEntity | null = null
        if (isUsername(usernameOrEmail)) {
            userEntity = await this.userRepo.findByUsername(usernameOrEmail)
        }
        if (isEmail(usernameOrEmail)) {
            userEntity = await this.userRepo.findByEmail(usernameOrEmail)
        }
        if (!userEntity) {
            return new BadRequestError('Username or Email is Invalid')
        }
        const resetPasswordToken = v4()
        await RedisRepo.setResetPasswordToken(resetPasswordToken, userEntity.id)
        sendEmail(userEntity.email, 'Reset Password', `https://murphyteam.ir/reset-password?token=${resetPasswordToken}`, 'Forget Password')
        return { msg: 'link sent' }
    }

    async forgetPassSetPass(data: SetPasswordDto): Promise<LoginSignUp> {
        const newPassword = await hash(data.newPassword)
        const token = data.token
        const userId = await RedisRepo.getResetPasswordUserId(token)
        if (!userId) return new BadRequestError('Invalid token')
        const userEntity = await this.userRepo.changePassword(userId, newPassword)
        const accessToken = generateToken(userEntitytoUserBasic(userEntity))
        if (accessToken instanceof ServerError) return accessToken
        let refreshToken = await RedisRepo.getSession(userId)
        if (!refreshToken) {
            const newRefreshToken = await createSession(userId)
            if (newRefreshToken instanceof ServerError) return newRefreshToken

            await RedisRepo.setSession(newRefreshToken, userEntity.id)
            refreshToken = newRefreshToken
        }
        const user = userEntitytoUser(userEntity)
        return { user, accessToken, refreshToken }
    }

    async editProfile(userBasic: UserBasic, data: EditProfileDto, file?: Express.Multer.File): Promise<{ user: User, token: Token } | ServerError> {
        const { password, ...rest } = data
        const payload: EditUser = rest
        if (data.password) {
            const newPassword = await hash(data.password)
            payload.password = newPassword
        }
        const editedUser = await this.userRepo.edit(userBasic.userId, payload)
        if (file) {
            await MinioRepo.uploadProfile(userBasic.userId, file)
        }
        const user = userEntitytoUser(editedUser)
        const newAccessToken = generateToken(usertoUserBasic(user))
        if (newAccessToken instanceof ServerError) return newAccessToken
        return { user, token: newAccessToken }
    }

    async getProfilePhoto(user: UserBasic): Promise<string> {
        const url = await MinioRepo.getProfileUrl(user.userId)
        return url
    }
}
