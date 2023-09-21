import { MinioRepo } from '../../../data-source'
import { Service } from '../../../registry/layer-decorators'
import { ForbiddenError, NotFoundError } from '../../../utility/http-error'
import { messages } from '../../../utility/persian-messages'
import { NotificationService } from '../../notification/bll/notification.service'
import { resMessage } from '../../post/bll/post.service'
import { Relation, RelationStatus } from '../model/relation'
import { User, UserWithStatus } from '../model/user'
import { UserId } from '../model/user-id'
import { CreateRelation, IRelationRepository, RelationRepository } from '../relation.repository'
import { UserService } from './user.service'
export type accessToUser = 'FullAccess' | 'JustProfile' | 'Denied'
export interface IRelationService {
    getTargetUser(userId: UserId, targetUserId: UserId): Promise<UserWithStatus | NotFoundError>
    getRelations(
        userId: UserId,
        targetId: UserId
    ): Promise<{
        relation: Relation | undefined
        reverseRelation: Relation | undefined
    }>
    checkAccessAuth(userId: UserId, targetUser: User, status: RelationStatus): Promise<accessToUser>
    getFollowing(id: UserId): Promise<UserId[]>
}

@Service(RelationRepository, UserService, NotificationService)
export class RelationService implements IRelationService {
    constructor(
        private relationRepo: IRelationRepository,
        private userService: UserService,
        private notifService: NotificationService
    ) {}
    async checkAccessAuth(userId: UserId, targetUser: User, status: RelationStatus) {
        const relation = (await this.getRelations(userId, targetUser.id)).relation
        if (targetUser.private === false || (relation && relation.status === 'Following')) {
            return 'FullAccess'
        } else if (relation && relation.status === 'Following') return 'JustProfile'
        return 'Denied'
    }

    async getRelations(userId: UserId, targetId: UserId) {
        const relationDao = await this.relationRepo.getRelation(userId, targetId)
        const reverseRelationDao = await this.relationRepo.getRelation(targetId, userId)
        return { relation: relationDao?.toRelation(), reverseRelation: reverseRelationDao?.toRelation() }
    }

    async follow(userId: UserId, targetId: UserId) {
        const target = await this.userService.getUserById(targetId)
        if (!target) return new NotFoundError(messages.userNotFound.persian)
        const relationDao = await this.relationRepo.getRelation(userId, target.id)
        const reverseRelationDao = await this.relationRepo.getRelation(target.id, userId)
        if (reverseRelationDao) {
            const status = reverseRelationDao.toRelation().status
            if (status === 'Blocked') return new ForbiddenError(messages.cantRequest.persian)
        }
        if (relationDao) {
            const status = relationDao.toRelation().status
            switch (status) {
                case 'Pending':
                    return { msg: messages.alreadyRequested.persian }
                case 'Blocked':
                    return new ForbiddenError(messages.cantRequest.persian)
                case 'Following':
                    return { msg: messages.alreadyFollowed.persian }
            }
        }
        const payload: CreateRelation = { userA: userId, userB: target.id, status: 'Following' }
        if (target.private) {
            payload.status = 'Pending'
        }
        await this.relationRepo.createRelation(payload)
        if (payload.status === 'Following') {
            this.notifService.createFollowNotification(target.id, userId)
            return { msg: messages.followSuccess.persian }
        }
        this.notifService.createRequestNotification(target.id, userId)
        return { msg: messages.requested.persian }
    }

    async unfollow(userId: UserId, targetId: UserId) {
        const target = await this.userService.getUserById(targetId)
        if (!target) return new NotFoundError(messages.userNotFound.persian)
        const dao = await this.relationRepo.getRelation(userId, target.id)
        if (!dao) return { msg: messages.notFollowing.persian }
        const status = dao.toRelation().status
        await this.relationRepo.deleteRelation({ userA: userId, userB: target.id })
        if (status == 'Following') {
            return { msg: messages.unfollowSuccess.persian }
        }
        return { msg: messages.requestDeleted.persian }
    }

    async acceptRequest(userId: UserId, targetId: UserId) {
        const target = await this.userService.getUserById(targetId)
        if (!target) return new NotFoundError(messages.userNotFound.persian)
        const dao = await this.relationRepo.getRelation(target.id, userId)
        if (!dao) return { msg: messages.requestNotFound.persian }
        const status = dao.toRelation().status
        if (status !== 'Pending') return { msg: messages.requestNotFound.persian }
        await this.relationRepo.updateRelation({ userA: target.id, userB: userId, status: 'Following' })
        return { msg: messages.accepted.persian }
    }

    async rejectRequest(userId: UserId, targetId: UserId) {
        const target = await this.userService.getUserById(targetId)
        if (!target) return new NotFoundError(messages.userNotFound.persian)
        const dao = await this.relationRepo.getRelation(target.id, userId)
        if (!dao) return { msg: messages.requestNotFound.persian }
        const status = dao.toRelation().status
        if (status !== 'Pending') return { msg: messages.requestNotFound.persian }
        await this.relationRepo.deleteRelation({ userA: target.id, userB: userId })
        await this.notifService.deleteNotification(userId, targetId, 'Request')
        return { msg: messages.rejected.persian }
    }

    async block(userId: UserId, targetId: UserId) {
        const target = await this.userService.getUserById(targetId)
        if (!target) return new NotFoundError(messages.userNotFound.persian)
        const dao = await this.relationRepo.getRelation(target.id, userId)
        if (dao) {
            const status = dao.toRelation().status
            await this.relationRepo.deleteRelation({ userA: target.id, userB: userId })
        }
        await this.relationRepo.updateRelation({ userA: userId, userB: targetId, status: 'Blocked' })
        return { msg: messages.blocked.persian }
    }

    async getTargetUser(userId: UserId, targetUserId: UserId): Promise<UserWithStatus | NotFoundError> {
        const target = await this.userService.getUserById(targetUserId)
        if (!target) return new NotFoundError(messages.userNotFound.persian)
        const dao = await this.relationRepo.getRelation(target.id, userId)
        let status = null
        const status1 = dao ? dao.toRelation().status : null
        if (dao) {
            status = dao.toRelation().status
        }
        const reverseRelationDao = await this.relationRepo.getRelation(userId, target.id)
        let reverseStatus = null
        if (reverseRelationDao) reverseStatus = reverseRelationDao.toRelation().status
        return { user: target, status, reverseStatus }
    }
    async getFollowing(id: UserId) {
        const relations = (await this.relationRepo.findByRelation(id, 'Following')).toRelationList()
        if (relations.length < 1) return []
        const users = relations.map((relation) => relation.userB)
        return users
    }
}
