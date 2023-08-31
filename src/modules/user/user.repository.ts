import { DataSource, Repository } from 'typeorm'
import { UserEntity } from './entity/user.entity'
import { Username } from './model/username'
import { Email } from '../../data/email'
import { Password } from './model/password'
import { UserId } from './model/user-id'
import { Repo } from '../../registry/layer-decorators'

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
    bio?: string
}

export interface IUserRepository {
    create(data: CreateUser): Promise<UserEntity>
    findByUsername(username: Username): Promise<UserEntity | null>
    findByEmail(email: Email): Promise<UserEntity | null>
    findById(userId: UserId): Promise<UserEntity | null>
    changePassword(userId: UserId, newPassword: Password): Promise<UserEntity>
    edit(userId: UserId, data: EditUser): Promise<UserEntity>
}

@Repo()
export class UserRepository implements IUserRepository {
    private userRepo: Repository<UserEntity>

    constructor(appDataSource: DataSource) {
        this.userRepo = appDataSource.getRepository(UserEntity)
    }
    async changePassword(userId: UserId, newPassword: Password): Promise<UserEntity> {
        return this.userRepo.save({ id: userId, password: newPassword })
    }
    async findByUsername(username: Username): Promise<UserEntity | null> {
        return this.userRepo.findOneBy({ username })
    }
    async findByEmail(email: Email): Promise<UserEntity | null> {
        return this.userRepo.findOneBy({ email })
    }
    async create(data: CreateUser): Promise<UserEntity> {
        return this.userRepo.save({ ...data })
    }
    async findById(userId: UserId): Promise<UserEntity | null> {
        return this.userRepo.findOneBy({ id: userId })
    }
    async edit(userId: UserId, data: EditUser):Promise<UserEntity> {
        return this.userRepo.save({ id: userId, ...data })
    }
}
