import { Brand } from '../../../utility/brand'
import { UserEntity } from '../entity/user.entity'
import { User, UserBasic, UserShort, UserWithPassword } from '../model/user'

const convert = (input: UserEntity) => {
    return {
        toUser(): User {
            const { createdAt, updatedAt, likes, bookmarks, password, ...rest } = input
            return { ...rest, photo: '' }
        },
        toUserBasic(): UserBasic {
            const { id: userId, username, name, lastname } = input
            return { userId, username, name, lastname }
        },
        toUserWithPassword(): UserWithPassword {
            const { createdAt, updatedAt, likes, bookmarks, ...rest } = input
            return { ...rest, photo: '' }
        },
        toUserShort(): UserShort {
            const { id, username, name, lastname } = input
            return { id, username, name, lastname, photo: '' }
        },
    }
}

export const userDao = (input: UserEntity | null) => {
    if (!input) return null
    return convert(input)
}

export const userDaoList = (input: UserEntity[]) => {
    return input.map((entity) => convert(entity))
}

export const userEntityToUserShort = (input: UserEntity): UserShort => {
    return {
        id: input.id,
        lastname: input.lastname,
        name: input.name,
        photo: '',
        username: input.username,
    }
}
