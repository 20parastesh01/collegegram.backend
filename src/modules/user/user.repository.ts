import { DataSource, Repository } from 'typeorm'
import { UserEntity } from './entity/user.entity'
import { Username } from './model/username'
import { Email } from '../../data/email'
import { Password } from './model/password'
import { UserId } from './model/user-id'
import { Repo } from '../../registry/layer-decorators'
import { userDao, userListDao } from './bll/user.dao'
import { WholeNumber } from '../../data/whole-number'

export interface CreateUser {
    username: Username
    password: Password
    email: Email
    name: string
    lastname: string
    photo: string
    bio: string
}

export interface EditUser {
    email?: Email,
    name?: string,
    lastname?: string,
    password?: Password,
    private?: boolean,
    bio?: string,
    followers?: WholeNumber
    following?: WholeNumber
}

export interface IUserRepository {
    create(data: CreateUser): Promise<ReturnType<typeof userDao>>
    findByUsername(username: Username): Promise<ReturnType<typeof userDao>>
    findByEmail(email: Email): Promise<ReturnType<typeof userDao>>
    findById(userId: UserId): Promise<ReturnType<typeof userDao>>
    findListById(userIds:{id: UserId}[]): Promise<ReturnType<typeof userListDao>>
    changePassword(userId: UserId, newPassword: Password): Promise<ReturnType<typeof userDao>>
    edit(userId: UserId, data: EditUser): Promise<ReturnType<typeof userDao>>
}

@Repo()
export class UserRepository implements IUserRepository {
    private userRepo: Repository<UserEntity>

    constructor(appDataSource: DataSource) {
        this.userRepo = appDataSource.getRepository(UserEntity)
    }
    async changePassword(userId: UserId, newPassword: Password): Promise<ReturnType<typeof userDao>> {
        const userEntity = await this.userRepo.save({ id: userId, password: newPassword })
        return userDao(userEntity)
    }
    async findByUsername(username: Username): Promise<ReturnType<typeof userDao>> {
        const userEntity = await this.userRepo.findOneBy({ username })
        return userDao(userEntity)
    }
    async findByEmail(email: Email): Promise<ReturnType<typeof userDao>> {
        const userEntity = await this.userRepo.findOneBy({ email })
        return userDao(userEntity)
    }
    async create(data: CreateUser) {
        const userEntity = await this.userRepo.save({ ...data })
        return userDao(userEntity)
    }
    async findById(userId: UserId): Promise<ReturnType<typeof userDao>> {
        const userEntity = await this.userRepo.findOneBy({ id: userId })
        return userDao(userEntity)
    }
    async findListById(userIds:{id: UserId}[]): Promise<ReturnType<typeof userListDao>> {
        const userEntities = await this.userRepo.findBy(userIds)
        return userListDao(userEntities)
    }
    async edit(userId: UserId, data: EditUser): Promise<ReturnType<typeof userDao>> {
        const userEntity = await this.userRepo.save({ id: userId, ...data })
        return userDao(userEntity)
    }
}
