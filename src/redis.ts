import { createClient } from 'redis'
import { Hashed, isHashed } from './data/hashed'
import { UserId, isUserId } from './modules/user/model/user-id'

const redisPass = process.env.REDIS_PASS
const redisHost = process.env.REDIS_HOST
const redisPort = process.env.REDIS_PORT

export class Redis {
    private client
    constructor() {
        this.client = createClient({
            url: `redis://:${redisPass}@${redisHost}:${redisPort}`,
        })
    }

    async initialize() {
        await this.client.connect()
    }

    async setSession(session: Hashed, userId: UserId) {
        await this.client.set(session, userId)
        await this.client.set(userId + '', session)
    }

    async getSession(userId: UserId): Promise<Hashed | null> {
        const session = await this.client.get(userId + '')
        if (isHashed(session)) return session
        return null
    }

    async getUserId(session: Hashed): Promise<UserId | null> {
        const userId = await this.client.get(session)
        if (isUserId(userId)) return userId
        return null
    }
}
