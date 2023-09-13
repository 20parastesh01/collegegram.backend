import { SimpleMessage } from '../../../data/simple-message'
import { ForbiddenError, NotFoundError } from '../../../utility/http-error'
import { messages } from '../../../utility/persian-messages'
import { NotificationService } from '../../notification/bll/notification.service'
import { relationDao } from '../bll/relation.dao'
import { RelationService } from '../bll/relation.service'
import { UserService } from '../bll/user.service'
import { RelationEntity } from '../entity/relation.entity'
import { UserEntity } from '../entity/user.entity'
import { UserId } from '../model/user-id'
import { RelationRepository } from '../relation.repository'

const createHandler = (...deps: any[][]) => {
    const result = []
    for (let dep of deps) {
        let index = -1
        const fff = () => {
            index = index + 1
            return dep[index]
        }
        result.push(fff)
    }
    return result
}

let resolvesHandler = createHandler([null], [null])

const mockRelationRepo: Partial<RelationRepository> = {
    getRelation: jest.fn().mockImplementation(() => relationDao(resolvesHandler[1]())),
    createRelation: jest.fn(),
    deleteRelation: jest.fn(),
    updateRelation: jest.fn(),
}
const mockUserService: Partial<UserService> = {
    getUserById: jest.fn().mockImplementation(() => resolvesHandler[0]()),
}
const relationService = new RelationService(mockRelationRepo as RelationRepository, mockUserService as UserService, {} as NotificationService)

describe('Relation Service', () => {
    describe('Follow', () => {
        it('should fail if user not found', async () => {
            resolvesHandler = createHandler([null], [null])
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should fail if user has blocked the user', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [null, { status: 'Blocked' }])
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(ForbiddenError)
            expect((result as ForbiddenError).message).toBe(messages.cantRequest.persian)
        })
        it('should say you already have requested if already requested', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Pending' }])

            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.alreadyRequested.persian)
        })
        it('should say you already have followed if already followed', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Following' }])

            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.alreadyFollowed.persian)
        })
        it('should request if the account is private', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId, private: true }], [null])

            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requested.persian)
        })
        it('should follow if the account is public', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [null])

            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.followSuccess.persian)
        })
    })
    describe('Unfollow', () => {
        it('should fail if user not found', async () => {
            resolvesHandler = createHandler([null], [null])

            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [null])

            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.notFollowing.persian)
        })
        it('should say unfollowed', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Following' }])

            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.unfollowSuccess.persian)
        })
        it('should say request deleted', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Pending' }])

            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestDeleted.persian)
        })
    })
    describe('Accept', () => {
        it('should fail if user not found', async () => {
            resolvesHandler = createHandler([null], [null])

            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [null])

            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Blocked' }])

            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Following' }])

            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request accepted', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Pending' }])

            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.accepted.persian)
        })
    })
    describe('Reject', () => {
        it('should fail if user not found', async () => {
            resolvesHandler = createHandler([null], [null])

            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [null])

            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Blocked' }])

            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Following' }])

            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request deleted', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [{ status: 'Pending' }])

            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.rejected.persian)
        })
    })
    describe('Blocked', () => {
        it('should fail if user not found', async () => {
            resolvesHandler = createHandler([null], [null])

            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say user blocked', async () => {
            resolvesHandler = createHandler([{ id: 6 as UserId }], [null])

            const result = await relationService.block(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.blocked.persian)
        })
    })
})
