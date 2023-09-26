import { DataSource, Repository } from 'typeorm'
import { Repo } from '../../registry/layer-decorators'
import { closeFriendDao } from './bll/closefriend.dao'
import { CloseFriendEntity } from './entity/closefriend.entity'
import { UserId } from './model/user-id'

export interface CreateCloseFriend {
    userA: UserId
    userB: UserId
}

export interface ICloseFriendRepository {
    findCloseFriend(userA: UserId, userB: UserId): Promise<ReturnType<typeof closeFriendDao>>
    createCloseFriend(payload: CreateCloseFriend): Promise<ReturnType<typeof closeFriendDao>>
    removeCloseFriend(userA: UserId, userB: UserId): Promise<void>
}

@Repo()
export class CloseFriendRepository implements ICloseFriendRepository {
    private closeFriendRepo: Repository<CloseFriendEntity>

    constructor(appDataSource: DataSource) {
        this.closeFriendRepo = appDataSource.getRepository(CloseFriendEntity)
    }

    async findCloseFriend(userA: UserId, userB: UserId) {
        const closeFriendEntity = await this.closeFriendRepo.findOneBy({ userA, userB })
        return closeFriendDao(closeFriendEntity)
    }

    async createCloseFriend(payload: CreateCloseFriend) {
        const closeFriendEntity = await this.closeFriendRepo.save({ userA: payload.userA, userB: payload.userB })
        return closeFriendDao(closeFriendEntity)
    }

    async removeCloseFriend(userA: UserId, userB: UserId) {
        await this.closeFriendRepo.delete({ userA, userB })
    }
}
