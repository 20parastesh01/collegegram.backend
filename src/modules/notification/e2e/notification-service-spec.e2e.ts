import { Express } from 'express'
import request from 'supertest'
import { AppDataSource } from '../../../data-source'
import { Token } from '../../../data/token'
import { messages } from '../../../utility/persian-messages'
import { prepare } from './preprate-database'
import { NotificationEntity } from '../entity/notification.entity'

type Method = 'post' | 'get' | 'patch' | 'delete'
describe('Notifications', () => {
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
    describe('Notification', () => {
        it('should create a notif when a user follow you', async () => {
            await requestAndExpect('follow', 2, 200, messages.followSuccess.persian, 1)
            const result = await request(app).get('/user/me/notification').set('Authorization', userTokens[1])
            expect(result.body).toHaveLength(1)
            const notif = result.body[0]
            expect(notif.type).toBe('Follow')
        })
        it('should create a notif when a user requests you', async () => {
            await requestAndExpect('follow', 3, 200, messages.requested.persian, 1)
            const result = await request(app).get('/user/me/notification').set('Authorization', userTokens[2])
            expect(result.body).toHaveLength(1)
            const notif = result.body[0]
            expect(notif.type).toBe('Request')
        })
    })
})
