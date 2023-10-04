import { QueryFailedError } from 'typeorm'
import { Email } from '../../../data/email'
import { WholeNumber } from '../../../data/whole-number'
import { BadRequestError, UnauthorizedError } from '../../../utility/http-error'
import { LoginSignUp, UserService } from '../bll/user.service'
import { LoginDto } from '../dto/login.dto'
import { SignUpDto } from '../dto/signup.dto'
import { UserEntity } from '../entity/user.entity'
import { InputPassword } from '../model/inputpassword'
import { Password } from '../model/password'
import { UserId } from '../model/user-id'
import { Username } from '../model/username'
import { CreateUser, EditUser, IUserRepository } from '../user.repository'
import { Hashed } from '../../../data/hashed'
import { SendEmailDto } from '../dto/send-email.dto'
import { isSimpleMessage } from '../../../data/simple-message'
import { RedisRepo } from '../../../data-source'
import { userDao, userDaoList } from '../bll/user.dao'
import * as emailUtils from '../../../utility/send-email'
import { User, UserShort } from '../model/user'

class MockUserRepository implements IUserRepository {
    public users: UserEntity[] = []
    constructor() {
        this.users.push({
            id: 1 as UserId,
            username: 'testuser1' as Username,
            password: '$2a$08$UeuTcuO8jxuLOm5KsWN/Pun8XyaXvo7EcQyhuIesGihFqkJLv5BNi' as Password,
            email: 'test1@example.com' as Email,
            name: '',
            lastname: '',
            bio: '',
            followers: 0 as WholeNumber,
            following: 0 as WholeNumber,
            postsCount: 0 as WholeNumber,
            private: false,
            likes: [],
            bookmarks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }
    findAllPrivateIds(): Promise<UserId[]> {
        throw new Error('Method not implemented.')
    }
    getInfoByIds(userIds: UserId[]): Promise<UserShort[]> {
        throw new Error('Method not implemented.')
    }
    findListById(userIds: { id: UserId }[]): Promise<ReturnType<typeof userDaoList>> {
        throw new Error('Method not implemented.')
    }
    edit(userId: UserId, data: EditUser): Promise<ReturnType<typeof userDao>> {
        throw new Error('Method not implemented.')
    }

    async changePassword(userId: UserId, newPassword: Password): Promise<ReturnType<typeof userDao>> {
        let userEntity = this.users.find((a) => a.id == userId)
        if (!userEntity) throw new Error('User not Found')
        const index = this.users.indexOf(userEntity)
        userEntity.password = newPassword
        this.users[index] = userEntity
        return userDao(userEntity)
    }

    async create(inputUser: CreateUser): Promise<ReturnType<typeof userDao>> {
        let dao = await this.findByUsername(inputUser.username)
        if (dao) {
            throw new QueryFailedError('', [''], 'Username Exists')
        }
        dao = await this.findByEmail(inputUser.email)
        if (dao) {
            throw new QueryFailedError('', [''], 'Email Exists')
        }
        this.users.push({
            ...inputUser,
            id: 2 as UserId,
            name: '',
            lastname: '',
            bio: '',
            followers: 0 as WholeNumber,
            following: 0 as WholeNumber,
            postsCount: 0 as WholeNumber,
            private: false,
            likes: [],
            bookmarks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        return userDao({
            ...inputUser,
            id: 2 as UserId,
            name: '',
            lastname: '',
            bio: '',
            followers: 0 as WholeNumber,
            following: 0 as WholeNumber,
            postsCount: 0 as WholeNumber,
            private: false,
            likes: [],
            bookmarks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    async findById(userId: UserId): Promise<ReturnType<typeof userDao>> {
        return userDao(this.users.find((user) => user.id === userId) || null)
    }
    async findByUsername(username: Username): Promise<ReturnType<typeof userDao>> {
        return userDao(this.users.find((user) => user.username === username) || null)
    }
    async findByEmail(email: Email): Promise<ReturnType<typeof userDao>> {
        return userDao(this.users.find((user) => user.email === email) || null)
    }
    async findUsersNotInIds(userId: UserId, userIds: UserId[], offset: number, limit: number): Promise<ReturnType<typeof userDaoList>> {
        throw new Error('Method not implemented.')
    }
}

describe('UserService', () => {
    let userService: UserService
    let mockUserRepository: MockUserRepository
    beforeEach(() => {
        mockUserRepository = new MockUserRepository()
        userService = new UserService(mockUserRepository)
    })

    beforeAll(async () => {
        await RedisRepo.initialize()
    })

    afterAll(async () => {
        await RedisRepo.disconnect()
    })

    it('should log in successfully with username', async () => {
        const data: LoginDto = {
            usernameOrEmail: 'testuser1' as Username | Email,
            password: 'hashedpassword1' as InputPassword,
            rememberMe: false,
        }

        const result: LoginSignUp = await userService.login(data)

        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('accessToken')
        expect(result).toHaveProperty('refreshToken')
    })

    it('should log in successfully with email', async () => {
        const data: LoginDto = {
            usernameOrEmail: 'test1@example.com' as Username | Email,
            password: 'hashedpassword1' as InputPassword,
            rememberMe: false,
        }
        const result: LoginSignUp = await userService.login(data)

        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('accessToken')
        expect(result).toHaveProperty('refreshToken')
    })

    it('should fail login with incorrect password', async () => {
        const data: LoginDto = { usernameOrEmail: 'testuser1' as Username | Email, password: 'wrongpassword' as InputPassword, rememberMe: false }
        const result = await userService.login(data)
        expect(result).toBeInstanceOf(UnauthorizedError)
    })

    it('should fail login with non-existent username/email', async () => {
        const data: LoginDto = { usernameOrEmail: 'testuser3' as Username | Email, password: 'hashedpassword3' as InputPassword, rememberMe: false }
        const result = await userService.login(data)
        expect(result).toBeInstanceOf(UnauthorizedError)
    })

    it('should sign up successfully', async () => {
        const data: SignUpDto = {
            username: 'testuser' as Username,
            email: 'test@example.com' as Email,
            password: 'hashedpassword' as InputPassword,
        }

        const result: LoginSignUp = await userService.signup(data)

        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('accessToken')
        expect(result).toHaveProperty('refreshToken')
    })

    it('should fail signup with existing username', async () => {
        const data: SignUpDto = {
            username: 'testuser1' as Username,
            email: 'test1@example.com' as Email,
            password: 'hashedpassword1' as InputPassword,
        }
        const result = await userService.signup(data)

        expect(result).toBeInstanceOf(BadRequestError)
    })

    it('should fail signup with existing email', async () => {
        const data: SignUpDto = {
            username: 'newuser' as Username,
            email: 'test1@example.com' as Email,
            password: 'newhashedpassword' as InputPassword,
        }

        const result = await userService.signup(data)

        expect(result).toBeInstanceOf(BadRequestError)
    })

    it('should send email successfully with username', async () => {
        const sendEmailMock = jest.spyOn(emailUtils, 'sendEmail')
        sendEmailMock.mockImplementation(() => {})
        const data: SendEmailDto = {
            usernameOrEmail: 'testuser1' as Username | Email,
        }
        const result = await userService.forgetPassSendEmail(data)
        expect(isSimpleMessage(result)).toBe(true)
    })

    it('should send email successfully with email', async () => {
        const data: SendEmailDto = {
            usernameOrEmail: 'test1@example.com' as Username | Email,
        }
        const result = await userService.forgetPassSendEmail(data)
        expect(isSimpleMessage(result)).toBe(true)
    })

    it('should fail if username/email does not exist', async () => {
        const data: SendEmailDto = {
            usernameOrEmail: 'testuserrr' as Username | Email,
        }
        const result = await userService.forgetPassSendEmail(data)
        expect(result).toBeInstanceOf(BadRequestError)
    })
})
