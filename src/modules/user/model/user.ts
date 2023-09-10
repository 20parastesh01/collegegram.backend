import { Email } from '../../../data/email'
import { Hashed } from '../../../data/hashed'
import { Token } from '../../../data/token'
import { WholeNumber } from '../../../data/whole-number'
import { Password } from './password'
import { UserId, isUserId } from './user-id'
import { Username, isUsername } from './username'

export interface User {
    id: UserId
    username: Username
    email: Email
    name: string
    lastname: string
    photo: string
    followers: WholeNumber
    following: WholeNumber
    bio: string
    postsCount: WholeNumber
    private: boolean
}

export interface UserWithPassword extends User {
    password: Password
}

export interface UserWithToken {
    user: User
    accessToken: Token
    refreshToken: Hashed
}

export interface UserBasic {
    userId: UserId
    username: Username
    name: string
    lastname: string
}
export const isUserBasic = (payload: unknown): payload is UserBasic => {
    return payload !== null && typeof payload == 'object' && 'userId' in payload && 'username' in payload && isUserId(payload.userId) && isUsername(payload.username)
}
