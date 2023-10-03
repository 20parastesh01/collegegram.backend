import { DataSource, Repository } from 'typeorm'
import { Repo } from '../../registry/layer-decorators'
import { relationDao, relationListDao } from './bll/relation.dao'
import { RelationEntity } from './entity/relation.entity'
import { UserId } from './model/user-id'
import { RelationStatus } from './model/relation'
import { User } from './model/user'
import { UserEntity } from './entity/user.entity'
import { PaginationInfo } from '../../data/pagination'

export interface CreateRelation {
    userA: UserId
    userB: UserId
    status: Exclude<RelationStatus, 'Blocked'>
}

export interface EditRelation {
    userA: UserId
    userB: UserId
    status: RelationStatus
}

export type DeleteRelation = Omit<CreateRelation, 'status'>

export interface IRelationRepository {
    getRelation(userA: UserId, userB: UserId): Promise<ReturnType<typeof relationDao>>
    createRelation(payload: CreateRelation): Promise<ReturnType<typeof relationDao>>
    deleteRelation(payload: DeleteRelation): Promise<void>
    updateRelation(payload: EditRelation): Promise<ReturnType<typeof relationDao>>
    //findRelatedUsers(userId: UserId): Promise<UserId[]>
    findRelations(userId: UserId): Promise<ReturnType<typeof relationListDao>>
    findByRelation(userId: UserId, status: RelationStatus): Promise<ReturnType<typeof relationListDao>>
    findFollowers(userId: UserId, paginationInfo: PaginationInfo): Promise<UserId[]>
    findFollowings(userId: UserId, paginationInfo: PaginationInfo): Promise<UserId[]>
    findBlockeds(userId: UserId, paginationInfo: PaginationInfo): Promise<UserId[]>
    findFollowersCount(userId: UserId): Promise<number>
    findFollowingsCount(userId: UserId): Promise<number>
}

@Repo()
export class RelationRepository implements IRelationRepository {
    private relationRepo: Repository<RelationEntity>

    constructor(appDataSource: DataSource) {
        this.relationRepo = appDataSource.getRepository(RelationEntity)
    }

    async getRelation(userA: UserId, userB: UserId) {
        const relationEntity = await this.relationRepo.findOneBy({ userA, userB })
        return relationDao(relationEntity)
    }

    async createRelation(payload: CreateRelation) {
        const relationEntity = await this.relationRepo.save({ userA: payload.userA, userB: payload.userB, status: payload.status })
        return relationDao(relationEntity)
    }

    async updateRelation(payload: CreateRelation) {
        const relationEntity = await this.relationRepo.save({ userA: payload.userA, userB: payload.userB, status: payload.status })
        return relationDao(relationEntity)
    }

    async deleteRelation(payload: DeleteRelation) {
        await this.relationRepo.delete({ userA: payload.userA, userB: payload.userB })
    }

    async findRelations(userId: UserId): Promise<ReturnType<typeof relationListDao>> {
        const relations = await this.relationRepo.find({
            where: [{ userA: userId }, { userB: userId }],
        })
        return relationListDao(relations)
    }
    async findByRelation(userId: UserId, status: RelationStatus) {
        const result: RelationEntity[] = await this.relationRepo.createQueryBuilder('relation').where('relation.userA = :userId', { userId }).andWhere('relation.status = :status', { status }).getMany()

        return relationListDao(result)
    }

    async findFollowers(userId: UserId, paginationInfo: PaginationInfo) {
        const { page, pageSize } = paginationInfo
        const followersUserId = await this.relationRepo.find({ where: { userB: userId, status: 'Following' }, take: pageSize, skip: (page - 1) * pageSize })
        const result = followersUserId.map((a) => a.userA)
        return result
    }

    async findFollowings(userId: UserId, paginationInfo: PaginationInfo) {
        const { page, pageSize } = paginationInfo
        const followersUserId = await this.relationRepo.find({ where: { userA: userId, status: 'Following' }, take: pageSize, skip: (page - 1) * pageSize })
        const result = followersUserId.map((a) => a.userB)
        return result
    }

    async findBlockeds(userId: UserId, paginationInfo: PaginationInfo) {
        const { page, pageSize } = paginationInfo
        const followersUserId = await this.relationRepo.find({ where: { userA: userId, status: 'Blocked' }, take: pageSize, skip: (page - 1) * pageSize })
        const result = followersUserId.map((a) => a.userA)
        return result
    }

    async findFollowersCount(userId: UserId) {
        const count = await this.relationRepo.count({ where: { userB: userId, status: 'Following' } })
        return count
    }

    async findFollowingsCount(userId: UserId) {
        const count = await this.relationRepo.count({ where: { userA: userId, status: 'Following' } })
        return count
    }
}
