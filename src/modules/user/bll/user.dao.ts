import { Brand } from '../../../utility/brand'
import { UserEntity } from '../entity/user.entity'
import { User, UserBasic, UserWithPassword } from '../model/user'

export const usertoUserBasic = (input: User): UserBasic => {
    const { id: userId, username, name, lastname, photo } = input
    return { userId, username, name, lastname, photo }
}

export const userWithPasswordtoUser = (input: UserWithPassword): User => {
    const { password, ...user } = input
    return user
}

export const userDao = (input: UserEntity | null) => {
    return {
        toUser(): null | User {
            if (input === null) return null
            const { createdAt, updatedAt, password, ...rest } = input
            return rest
        },
        toUserBasic() {
            if (!input) return null
            const { id: userId, username, name, lastname, photo } = input
            return { userId, username, name, lastname, photo }
        },
        toUserWithPassword() {
            if (!input) return null
            const { createdAt, updatedAt, ...rest } = input
            return rest
        }
    }
}
