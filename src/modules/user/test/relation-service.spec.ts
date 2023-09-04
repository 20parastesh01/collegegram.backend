import { SimpleMessage } from '../../../data/simple-message'
import { ForbiddenError, NotFoundError } from '../../../utility/http-error'
import { messages } from '../../../utility/persian-messages'
import { relationDao } from '../bll/relation.dao'
import { RelationService } from '../bll/relation.service'
import { RelationEntity } from '../entity/relation.entity'
import { UserEntity } from '../entity/user.entity'
import { UserId } from '../model/user-id'

let resolves: {
    userEntity: Partial<UserEntity | null>
    relationEntity: Partial<RelationEntity | null>
} = {
    userEntity: { id: 6 as UserId },
    relationEntity: null,
}

const setResolves = <T extends keyof typeof resolves>(data: { [key in T]: (typeof resolves)[key] }) => {
    resolves = { ...resolves, ...data }
}

const mockRelationRepo: any = {
    getRelation: jest.fn(() => relationDao(resolves.relationEntity as RelationEntity)),
    createRelation: jest.fn(),
    deleteRelation: jest.fn(),
    updateRelation: jest.fn(),
}
const mockUserService: any = {
    getUserById: jest.fn(() => resolves.userEntity),
    increaseFollower: jest.fn(),
    increaseFollowing: jest.fn(),
    decreaseFollower: jest.fn(),
    decreaseFollowing: jest.fn(),
}
const relationService = new RelationService(mockRelationRepo, mockUserService)

describe('Relation Service', () => {
    describe('Follow', () => {
        it('should fail if user not found', async () => {
            setResolves({ userEntity: null })
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should fail if user has blocked the user', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Blocked' } })
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(ForbiddenError)
            expect((result as ForbiddenError).message).toBe(messages.cantRequest.persian)
        })
        it('should say you already have requested if already requested', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Pending' } })
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.alreadyRequested.persian)
        })
        it('should say you already have followed if already followed', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Following' } })
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.alreadyFollowed.persian)
        })
        it('should request if the account is private', async () => {
            setResolves({ userEntity: { id: 6 as UserId, private: true }, relationEntity: null })
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requested.persian)
        })
        it('should follow if the account is public', async () => {
            setResolves({ userEntity: { id: 6 as UserId, private: false }, relationEntity: null })
            const result = await relationService.follow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.followSuccess.persian)
        })
    })
    describe('Unfollow', () => {
        it('should fail if user not found', async () => {
            setResolves({ userEntity: null })
            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: null })
            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.notFollowing.persian)
        })
        it('should say unfollowed', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Following' } })
            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.unfollowSuccess.persian)
        })
        it('should say request deleted', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Pending' } })
            const result = await relationService.unfollow(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestDeleted.persian)
        })
    })
    describe('Accept', () => {
        it('should fail if user not found', async () => {
            setResolves({ userEntity: null })
            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: null })
            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Blocked' } })
            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Following' } })
            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request accepted', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Pending' } })
            const result = await relationService.acceptRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.accepted.persian)
        })
    })
    describe('Reject', () => {
        it('should fail if user not found', async () => {
            setResolves({ userEntity: null })
            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: null })
            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Blocked' } })
            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request not found', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Following' } })
            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.requestNotFound.persian)
        })
        it('should say request deleted', async () => {
            setResolves({ userEntity: { id: 6 as UserId }, relationEntity: { status: 'Pending' } })
            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.rejected.persian)
        })
    })
    describe('Blocked', () => {
        it('should fail if user not found', async () => {
            setResolves({ userEntity: null })
            const result = await relationService.rejectRequest(5 as UserId, 6 as UserId)
            expect(result).toBeInstanceOf(NotFoundError)
            expect((result as NotFoundError).message).toBe(messages.userNotFound.persian)
        })
        it('should say user blocked', async () => {
            setResolves({ userEntity: { id: 6 as UserId } })
            const result = await relationService.block(5 as UserId, 6 as UserId)
            expect(result).toHaveProperty('msg')
            expect((result as SimpleMessage).msg).toBe(messages.blocked.persian)
        })
    })
})
