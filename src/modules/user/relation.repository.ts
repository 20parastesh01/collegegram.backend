import { DataSource, Repository } from 'typeorm'
import { Repo } from '../../registry/layer-decorators'
import { relationDao } from './bll/relation.dao'
import { RelationEntity } from './entity/relation.entity'
import { UserId } from './model/user-id'
import { RelationStatus } from './model/relation'

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
}
