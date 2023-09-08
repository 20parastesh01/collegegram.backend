import { Service } from '../../../registry/layer-decorators'
import { ForbiddenError, NotFoundError } from '../../../utility/http-error'
import { messages } from '../../../utility/persian-messages'
import { UserId } from '../model/user-id'
import { CreateRelation, IRelationRepository, RelationRepository } from '../relation.repository'
import { IUserRepository, UserRepository } from '../user.repository'
import { UserService } from './user.service'

@Service(RelationRepository, UserService)
export class RelationService {
    constructor(
        private relationRepo: IRelationRepository,
        private userService: UserService
    ) {}

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
            return { msg: messages.followSuccess.persian }
        }
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
}
