import { PaginationInfo } from '../../../data/pagination'
import { Service, services } from '../../../registry/layer-decorators'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../utility/http-error'
import { messages } from '../../../utility/persian-messages'
import { CloseFriendRepository, CreateCloseFriend, ICloseFriendRepository } from '../closefriend.repository'
import { CloseFriend } from '../model/closefriend'
import { UserId } from '../model/user-id'
import { RelationService } from './relation.service'
import { UserService } from './user.service'

export interface ICloseFriendService {
    getCloseFriend(userId: UserId, targetUserId: UserId): Promise<CloseFriend | undefined>
    getUsersWhoCloseFriended(userId: UserId): Promise<UserId[]>
}

@Service(CloseFriendRepository, UserService)
export class CloseFriendService implements ICloseFriendService {
    constructor(
        private closeFriendRepo: ICloseFriendRepository,
        private userService: UserService
    ) {}

    async getCloseFriend(userId: UserId, targetUserId: UserId) {
        const closeFriendDao = await this.closeFriendRepo.findCloseFriend(userId, targetUserId)
        return closeFriendDao?.toCloseFriend()
    }

    async addCloseFriend(userId: UserId, targetUserId: UserId) {
        const targetUser = await this.userService.getUserById(targetUserId)
        if (!targetUser) return new NotFoundError(messages.userNotFound.persian)
        const closeFriend = await this.getCloseFriend(userId, targetUserId)
        if (closeFriend) return { msg: messages.closeFriendExists.persian }
        const relationService = services['RelationService'] as RelationService
        const relations = await relationService.getRelations(userId, targetUserId)
        if (relations) {
            if (relations.relation?.status === 'Blocked' || relations.reverseRelation?.status === 'Blocked') {
                return new ForbiddenError(messages.cantBeCloseFriend.persian)
            }
        }
        const payload: CreateCloseFriend = { userA: userId, userB: targetUserId }
        await this.closeFriendRepo.createCloseFriend(payload)
        return { msg: messages.closeFriendAdded.persian }
    }

    async removeCloseFriend(userId: UserId, targetUserId: UserId) {
        const targetUser = await this.userService.getUserById(targetUserId)
        if (!targetUser) return new NotFoundError(messages.userNotFound.persian)
        const closeFriend = await this.getCloseFriend(userId, targetUserId)
        if (!closeFriend) return { msg: messages.closeFriendNotExists.persian }
        await this.closeFriendRepo.removeCloseFriend(userId, targetUserId)
        return { msg: messages.closeFriendRemoved.persian }
    }

    async getCloseFriends(userId: UserId, paginationInfo: PaginationInfo) {
        const followerUserIds = await this.closeFriendRepo.findCloseFriends(userId, paginationInfo)
        const userShorts = await this.userService.getBatchUserInfo(followerUserIds)
        return userShorts
    }

    async getUsersWhoCloseFriended(userId: UserId) {
        const result = await this.closeFriendRepo.findUsersWhoCloseFriended(userId)
        return result
    }
}
