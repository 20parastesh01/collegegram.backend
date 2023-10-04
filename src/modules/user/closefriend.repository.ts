import { DataSource, Repository } from 'typeorm'
import { Repo } from '../../registry/layer-decorators'
import { closeFriendDao } from './bll/closefriend.dao'
import { CloseFriendEntity } from './entity/closefriend.entity'
import { UserId } from './model/user-id'
import { PaginationInfo } from '../../data/pagination'

export interface CreateCloseFriend {
    userA: UserId
    userB: UserId
}

export interface ICloseFriendRepository {
    findCloseFriend(userA: UserId, userB: UserId): Promise<ReturnType<typeof closeFriendDao>>
    createCloseFriend(payload: CreateCloseFriend): Promise<ReturnType<typeof closeFriendDao>>
    removeCloseFriend(userA: UserId, userB: UserId): Promise<void>
    findCloseFriends(userId: UserId, paginationInfo: PaginationInfo): Promise<UserId[]>
    findUsersWhoCloseFriended(userId: UserId): Promise<UserId[]>
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

    async findCloseFriends(userId: UserId, paginationInfo: PaginationInfo) {
        const { page, pageSize } = paginationInfo
        const followersUserId = await this.closeFriendRepo.find({ where: { userA: userId }, take: pageSize, skip: (page - 1) * pageSize })
        const result = followersUserId.map((a) => a.userB)
        return result
    }

    async findUsersWhoCloseFriended(userId: UserId): Promise<UserId[]> {
        const followersUserId = await this.closeFriendRepo.find({ where: { userB: userId } })
        const result = followersUserId.map((a) => a.userA)
        return result
    }
}
