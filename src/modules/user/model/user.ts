import { Email } from '../../../data/email'
import { Hashed } from '../../../data/hashed'
import { NonEmptyString } from '../../../data/non-empty-string'
import { Token } from '../../../data/token'
import { WholeNumber } from '../../../data/whole-number'
import { Password } from './password'
import { UserId } from './user-id'
import { Username } from './username'

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

export interface UserWithToken {
    user: User
    accessToken: Token
    refreshToken: Hashed
}
