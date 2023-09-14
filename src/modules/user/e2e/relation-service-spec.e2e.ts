import { Express } from 'express'
import request from 'supertest'
import { AppDataSource } from '../../../data-source'
import { Token } from '../../../data/token'
import { messages } from '../../../utility/persian-messages'
import { prepare } from './preprate-database'
import { RelationEntity } from '../entity/relation.entity'
import { UserId } from '../model/user-id'
type Method = 'post' | 'get' | 'patch' | 'delete'
describe('Relations', () => {
    let app: Express
    let userTokens: Token[]
    jest.setTimeout(15000)
    beforeAll(async () => {
        const { expressApp, tokens } = await prepare()
        app = expressApp
        userTokens = tokens
    })
    afterAll(async () => {
        await AppDataSource.dropDatabase()
        await AppDataSource.destroy()
    })
    const requestAndExpect = async (action: string, id: number, status: number, expectation: string, tokenIndex: number, method: Method = 'post') => {
        const result = await request(app)
            [method](`/user/${id}/${action}`)
            .set('Authorization', userTokens[tokenIndex - 1])
        expect(result.statusCode).toBe(status)
        const body = result.body
        const field = 'msg' in body ? 'msg' : 'error'
        expect(body[field]).toBe(expectation)
    }
    const checkFollowersAndFollowings = async (userId: number, followers: number, followings: number) => {
        const user = (
            await request(app)
                .get(`/user/me`)
                .set('Authorization', userTokens[userId - 1])
        ).body
        expect(user.following).toBe(followings)
        expect(user.followers).toBe(followers)
    }
    describe('Follow', () => {
        it('should fail if target does not exists', async () => {
            await requestAndExpect('follow', 40, 404, messages.userNotFound.persian, 1)
        })
        it('should fail if target has blocked the user', async () => {
            await requestAndExpect('follow', 3, 403, messages.cantRequest.persian, 1)
        })
        it('should successfully follow', async () => {
            await requestAndExpect('follow', 2, 200, messages.followSuccess.persian, 1)
            await checkFollowersAndFollowings(1, 0, 1)
            await checkFollowersAndFollowings(2, 1, 0)
        })
        it('should say request made', async () => {
            await requestAndExpect('follow', 4, 200, messages.requested.persian, 1)
            await requestAndExpect('follow', 5, 200, messages.requested.persian, 1)
            await requestAndExpect('follow', 6, 200, messages.requested.persian, 1)
            await checkFollowersAndFollowings(1, 0, 1)
            await checkFollowersAndFollowings(5, 0, 0)
            await checkFollowersAndFollowings(6, 0, 0)
        })
        it('should say already followed', async () => {
            await requestAndExpect('follow', 2, 200, messages.alreadyFollowed.persian, 1)
            await checkFollowersAndFollowings(1, 0, 1)
        })
        it('should say already requested', async () => {
            await requestAndExpect('follow', 4, 200, messages.alreadyRequested.persian, 1)
            await checkFollowersAndFollowings(1, 0, 1)
        })
    })

    describe('Unfollow', () => {
        it('should say request deleted', async () => {
            await requestAndExpect('unfollow', 4, 200, messages.requestDeleted.persian, 1, 'delete')
            await checkFollowersAndFollowings(1, 0, 1)
        })
        it('should say unfollowed', async () => {
            await requestAndExpect('unfollow', 2, 200, messages.unfollowSuccess.persian, 1, 'delete')
            await checkFollowersAndFollowings(1, 0, 0)
        })
        it('should say you were not following this user', async () => {
            await requestAndExpect('unfollow', 2, 200, messages.notFollowing.persian, 1, 'delete')
            await requestAndExpect('unfollow', 4, 200, messages.notFollowing.persian, 1, 'delete')
        })
    })

    describe('Accept', () => {
        it('should say request not found', async () => {
            await requestAndExpect('accept', 5, 200, messages.requestNotFound.persian, 5)
        })
        it('should say request accepted', async () => {
            await checkFollowersAndFollowings(1, 0, 0)
            await checkFollowersAndFollowings(5, 0, 0)
            await requestAndExpect('accept', 1, 200, messages.accepted.persian, 5)
            await checkFollowersAndFollowings(1, 0, 1)
            await checkFollowersAndFollowings(5, 1, 0)
        })
        it('should say request not found after acceptance', async () => {
            await requestAndExpect('accept', 1, 200, messages.requestNotFound.persian, 5)
            await checkFollowersAndFollowings(1, 0, 1)
            await checkFollowersAndFollowings(5, 1, 0)
        })
    })

    describe('Reject', () => {
        it('should say request not found', async () => {
            await requestAndExpect('reject', 4, 200, messages.requestNotFound.persian, 6, 'delete')
            await checkFollowersAndFollowings(1, 0, 1)
        })
        it('should say request accepted', async () => {
            await requestAndExpect('reject', 1, 200, messages.rejected.persian, 6, 'delete')
            await checkFollowersAndFollowings(1, 0, 1)
        })
        it('should say request not found after acceptance', async () => {
            await requestAndExpect('reject', 1, 200, messages.requestNotFound.persian, 6, 'delete')
            await checkFollowersAndFollowings(1, 0, 1)
        })
    })

    describe('Block', () => {
        it('should say user blocked', async () => {
            await requestAndExpect('block', 1, 200, messages.blocked.persian, 5)
            await checkFollowersAndFollowings(1, 0, 0)
            await checkFollowersAndFollowings(5, 0, 0)
        })
        it('should not create the record again', async () => {
            const relationRepo = AppDataSource.getRepository(RelationEntity)
            let count1 = await relationRepo.count()
            await requestAndExpect('block', 1, 200, messages.blocked.persian, 5)
            let count2 = await relationRepo.count()
            expect(count1).toBe(count2)
            await checkFollowersAndFollowings(1, 0, 0)
            await checkFollowersAndFollowings(5, 0, 0)
        })
        it('blocked user should not be able to request for follow', async () => {
            await requestAndExpect('follow', 5, 403, messages.cantRequest.persian, 1)
        })
    })
})
