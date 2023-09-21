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
import { User, UserBasic, UserWithPassword, UserWithToken } from '../model/user'
import { UserId } from '../model/user-id'
import { isUsername } from '../model/username'
import { EditUser, IUserRepository, UserRepository } from '../user.repository'
import { userDao } from './user.dao'
import { Service } from '../../../registry/layer-decorators'
import { EditProfileDto, editProfileDto } from '../dto/edit-profile.dto'
import { Token } from '../../../data/token'
import { PersianErrors, messages } from '../../../utility/persian-messages'
import { zodWholeNumber } from '../../../data/whole-number'

export type LoginSignUp = UserWithToken | BadRequestError | ServerError

export interface IUserService {
    signup(data: SignUpDto): Promise<LoginSignUp>
    login(data: LoginDto): Promise<LoginSignUp>
    getUserById(userId: UserId): Promise<User | null>
    getProfilePhoto(user: UserBasic): Promise<string>
    getUserListById(userIds: UserId[]): Promise<User[]>
    forgetPassSendEmail(data: SendEmailDto): Promise<SimpleMessage | BadRequestError>
    forgetPassSetPass(data: SetPasswordDto): Promise<LoginSignUp>
    editProfile(user: UserBasic, data: EditProfileDto, file?: Express.Multer.File): Promise<{ user: User; token: Token } | ServerError>
    getUnrelatedUsers(userId: UserId, userIds: UserId[]): Promise<User[]>
    logout(userId: UserId): Promise<SimpleMessage | BadRequestError>
}

export const hash = async (input: string): Promise<Password> => {
    const hashed = await bcrypt.hash(input, 8)
    if (isPassword(hashed)) {
        return hashed
    }
    throw new ServerError()
}

@Service(UserRepository)
export class UserService implements IUserService {
    constructor(private userRepo: IUserRepository) {}

    async login(data: LoginDto): Promise<LoginSignUp | UnauthorizedError> {
        const usernameOrEmail = data.usernameOrEmail
        const password = data.password
        let dao: ReturnType<typeof userDao> | null = null
        if (isUsername(usernameOrEmail)) {
            dao = await this.userRepo.findByUsername(usernameOrEmail)
        }
        if (isEmail(usernameOrEmail)) {
            dao = await this.userRepo.findByEmail(usernameOrEmail)
        }
        if (!dao) return new UnauthorizedError(PersianErrors.EmailOrUsernameNotFound)
        const userWithPassword = dao.toUserWithPassword()
        const isMatchPassword = await compareHash(password, userWithPassword.password)
        if (!isMatchPassword) {
            return new UnauthorizedError(PersianErrors.InvalidPassword)
        }
        const accessToken = generateToken(dao.toUserBasic())
        if (accessToken instanceof ServerError) return accessToken

        let refreshToken = await RedisRepo.getSession(userWithPassword.id)
        if (refreshToken) {
            RedisRepo.setNewExpire(refreshToken)
        }
        if (!refreshToken) {
            const newRefreshToken = await createSession(userWithPassword.id)
            if (newRefreshToken instanceof ServerError) return newRefreshToken

            await RedisRepo.setSession(newRefreshToken, userWithPassword.id, data.rememberMe)
            refreshToken = newRefreshToken
        }
        const user = dao.toUser()
        return { user, accessToken, refreshToken }
    }

    async signup(data: SignUpDto): Promise<LoginSignUp> {
        try {
            const password = await hash(data.password)
            const dao = (await this.userRepo.create({
                username: data.username,
                email: data.email,
                password,
                name: '',
                lastname: '',
                photo: '',
                bio: '',
            }))!
            const user = dao.toUser()
            const accessToken = generateToken(dao.toUserBasic())

            if (accessToken instanceof ServerError) return accessToken

            const refreshToken = await createSession(user.id)
            if (refreshToken instanceof ServerError) return refreshToken

            await RedisRepo.setSession(refreshToken, user.id, false)

            const result = { user, accessToken, refreshToken }
            return result
        } catch (e) {
            if (e instanceof QueryFailedError) {
                return new BadRequestError(PersianErrors.EmailOrUsernameExists)
            }
            return new ServerError()
        }
    }

    async getUserById(userId: UserId): Promise<User | null> {
        const dao = await this.userRepo.findById(userId)
        if (!dao) return null
        const user = dao.toUser()
        return user
    }

    async getUserBasicById(userId: UserId): Promise<UserBasic | null> {
        const dao = await this.userRepo.findById(userId)
        if (!dao) return null
        const user = dao.toUserBasic()
        return user
    }

    async forgetPassSendEmail(data: SendEmailDto): Promise<SimpleMessage | BadRequestError> {
        const usernameOrEmail = data.usernameOrEmail
        let dao: ReturnType<typeof userDao> | null = null
        if (isUsername(usernameOrEmail)) {
            dao = await this.userRepo.findByUsername(usernameOrEmail)
        }
        if (isEmail(usernameOrEmail)) {
            dao = await this.userRepo.findByEmail(usernameOrEmail)
        }
        if (!dao) return new BadRequestError(PersianErrors.EmailOrUsernameNotFound)
        const user = dao.toUser()
        const resetPasswordToken = v4()
        await RedisRepo.setResetPasswordToken(resetPasswordToken, user.id)
        sendEmail(user.email, 'Reset Password', `https://murphyteam.ir/reset-password?token=${resetPasswordToken}`, 'Forget Password')
        return { msg: 'link sent' }
    }

    async forgetPassSetPass(data: SetPasswordDto): Promise<LoginSignUp> {
        const newPassword = await hash(data.newPassword)
        const token = data.token
        const userId = await RedisRepo.getResetPasswordUserId(token)
        if (!userId) return new BadRequestError(PersianErrors.InvalidToken)
        const dao = (await this.userRepo.changePassword(userId, newPassword))!
        const user = dao.toUser()!
        const accessToken = generateToken(dao.toUserBasic())
        if (accessToken instanceof ServerError) return accessToken
        let refreshToken = await RedisRepo.getSession(userId)
        if (!refreshToken) {
            const newRefreshToken = await createSession(userId)
            if (newRefreshToken instanceof ServerError) return newRefreshToken

            await RedisRepo.setSession(newRefreshToken, user.id, false)
            refreshToken = newRefreshToken
        }
        return { user, accessToken, refreshToken }
    }

    async editProfile(userBasic: UserBasic, data: EditProfileDto, file?: Express.Multer.File): Promise<{ user: User; token: Token } | ServerError> {
        const { password, ...rest } = data
        const payload: EditUser = rest
        if (data.password) {
            const newPassword = await hash(data.password)
            payload.password = newPassword
        }
        const dao = (await this.userRepo.edit(userBasic.userId, payload))!
        const user = dao.toUser()
        if (file) {
            await MinioRepo.uploadProfile(userBasic.userId, file)
        }

        const newAccessToken = generateToken(dao.toUserBasic())
        if (newAccessToken instanceof ServerError) return newAccessToken
        return { user, token: newAccessToken }
    }

    async getProfilePhoto(user: UserBasic): Promise<string> {
        const url = await MinioRepo.getProfileUrl(user.userId)
        return url || ''
    }

    async getCurrentUser(id: UserId): Promise<User | null> {
        const dao = (await this.userRepo.findById(id))!
        if (!dao) return null
        const user = dao.toUser()
        const profile = await MinioRepo.getProfileUrl(id)
        user.photo = profile || ''
        return user
    }

    async increaseFollower(id: UserId): Promise<User | null> {
        const userDao = await this.userRepo.findById(id)
        if (!userDao) return null
        const followers = userDao.toUser().followers
        const editedDao = (await this.userRepo.edit(id, { followers: zodWholeNumber.parse(followers + 1) }))!
        return editedDao.toUser()
    }

    async decreaseFollower(id: UserId): Promise<User | null> {
        const userDao = await this.userRepo.findById(id)
        if (!userDao) return null
        const followers = userDao.toUser().followers
        const editedDao = (await this.userRepo.edit(id, { followers: zodWholeNumber.parse(followers - 1) }))!
        return editedDao.toUser()
    }

    async increaseFollowing(id: UserId): Promise<User | null> {
        const userDao = await this.userRepo.findById(id)
        if (!userDao) return null
        const following = userDao.toUser().following
        const editedDao = (await this.userRepo.edit(id, { following: zodWholeNumber.parse(following + 1) }))!
        return editedDao.toUser()
    }

    async decreaseFollowing(id: UserId): Promise<User | null> {
        const userDao = await this.userRepo.findById(id)
        if (!userDao) return null
        const following = userDao.toUser().following
        const editedDao = (await this.userRepo.edit(id, { following: zodWholeNumber.parse(following - 1) }))!
        return editedDao.toUser()
    }

    async getUnrelatedUsers(userId: UserId, userIds: UserId[]): Promise<User[]> {
        const usersDao = await this.userRepo.findUsersNotInIds(userId, userIds, 0, 25)
        let users = usersDao.map((a) => a.toUser())
        return users
    }
    async getUserListById(userIds: UserId[]) {
        const userList = userIds.map((userId) => ({ id: userId }))
        const usersDao = await this.userRepo.findListById(userList)
        const users = usersDao.map((a) => a.toUser())
        return users
    }

    async logout(userId: UserId): Promise<SimpleMessage> {
        await RedisRepo.deleteSession(userId)
        return { msg: 'User Logged Out' }
    }
}
