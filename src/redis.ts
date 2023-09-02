import { createClient } from 'redis'
import { Hashed, isHashed } from './data/hashed'
import { UserId, isUserId } from './modules/user/model/user-id'

const redisPass = process.env.REDIS_PASS
const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT
export interface IRedis {
    setSession(session: Hashed, userId: UserId, remember: boolean): Promise<void>
    setNewExpire(session: Hashed): Promise<void>
    getSession(userId: UserId): Promise<Hashed | null>
    getUserId(session: Hashed): Promise<UserId | null>
    setResetPasswordToken(uuId: string, userId: UserId): Promise<void>
    getResetPasswordUserId(uuId: string): Promise<UserId | null>
}
export class Redis implements IRedis {
    private client
    constructor() {
        this.client = createClient({
            url: `redis://:${redisPass}@${redisHost}:${redisPort}`,
        })
    }

    async initialize() {
        await this.client.connect()
    }

    async setSession(session: Hashed, userId: UserId, remember: boolean) {
        await this.client.set(session, userId)
        await this.client.set(userId + '', session)
        const expireTime = remember ? 24 * 3600 : 6 * 3600

        await this.client.set(session + '-remember', expireTime)
        await this.client.expire(session, expireTime)
        await this.client.expire(userId + '', expireTime)
        await this.client.expire(session + '-remember', expireTime)
    }

    async setNewExpire(session: Hashed) {
        const expireTime = Number(await this.client.get(session + '-remember'))
        await this.client.expire(session, expireTime)
        await this.client.expire(session + '-remember', expireTime)
        const userId = await this.client.get(session)
        if (userId) await this.client.expire(userId + '', expireTime)
    }

    async getSession(userId: UserId): Promise<Hashed | null> {
        const session = await this.client.get(userId + '')
        if (isHashed(session)) return session
        return null
    }

    async getUserId(session: Hashed): Promise<UserId | null> {
        const userId = await this.client.get(session)
        const convertedUserId = Number(userId)
        if (isUserId(convertedUserId)) return convertedUserId
        return null
    }

    async disconnect() {
        await this.client.quit()
    }

    async setResetPasswordToken(uuId: string, userId: UserId) {
        await this.client.set(uuId + '', userId)
        await this.client.expire(uuId + '', 3600)
    }

    async getResetPasswordUserId(uuId: string): Promise<UserId | null> {
        const userId = await this.client.get(uuId + '')
        const convertedUserId = Number(userId)
        if (isUserId(convertedUserId)) return convertedUserId
        return null
    }
}
