import { QueryFailedError } from 'typeorm'
import { RedisRepo } from '../../../data-source'
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
import { CreateUser, IUserRepository } from '../user.repository'

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
            photo: '',
            bio: '',
            followers: 0 as WholeNumber,
            following: 0 as WholeNumber,
            postsCount: 0 as WholeNumber,
            private: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }
    async create(user: CreateUser): Promise<UserEntity> {
        const userEntityWithName = await this.findByUsername(user.username)
        if (userEntityWithName) {
            throw new QueryFailedError('', [''], '')
        }
        const userEntityWithEmail = await this.findByEmail(user.email)
        if (userEntityWithEmail) {
            throw new QueryFailedError('', [''], '')
        }
        this.users.push({
            ...user,
            id: 2 as UserId,
            name: '',
            lastname: '',
            photo: '',
            bio: '',
            followers: 0 as WholeNumber,
            following: 0 as WholeNumber,
            postsCount: 0 as WholeNumber,
            private: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        return {
            ...user,
            id: 2 as UserId,
            name: '',
            lastname: '',
            photo: '',
            bio: '',
            followers: 0 as WholeNumber,
            following: 0 as WholeNumber,
            postsCount: 0 as WholeNumber,
            private: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }

    async findById(userId: UserId): Promise<UserEntity | null> {
        return this.users.find((user) => user.id === userId) || null
    }
    async findByUsername(username: Username): Promise<UserEntity | null> {
        return this.users.find((user) => user.username === username) || null
    }
    async findByEmail(email: Email): Promise<UserEntity | null> {
        return this.users.find((user) => user.email === email) || null
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
        }
        const result: LoginSignUp = await userService.login(data)

        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('accessToken')
        expect(result).toHaveProperty('refreshToken')
    })

    it('should fail login with incorrect password', async () => {
        const data: LoginDto = { usernameOrEmail: 'testuser1' as Username | Email, password: 'wrongpassword' as InputPassword }
        const result = await userService.login(data)
        expect(result).toBeInstanceOf(UnauthorizedError)
    })

    it('should fail login with non-existent username/email', async () => {
        const data: LoginDto = { usernameOrEmail: 'testuser3' as Username | Email, password: 'hashedpassword3' as InputPassword }
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
})
