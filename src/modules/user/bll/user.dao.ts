import { UserEntity } from '../entity/user.entity'
import { User, UserBasic } from '../model/user'

export const userEntitytoUser = (input: UserEntity): User => {
    const { createdAt, updatedAt, password, ...rest } = input
    return rest
}

export const userEntitytoUserBasic = (input: UserEntity): UserBasic => {
    const { id: userId, username, name, lastname, photo } = input
    return { userId, username, name, lastname, photo }
}

export const usertoUserBasic = (input: User): UserBasic => {
    const { id: userId, username, name, lastname, photo } = input
    return { userId, username, name, lastname, photo }
}
