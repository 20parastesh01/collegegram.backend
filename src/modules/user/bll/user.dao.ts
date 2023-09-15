import { Brand } from '../../../utility/brand'
import { UserEntity } from '../entity/user.entity'
import { User, UserBasic, UserShort, UserWithPassword } from '../model/user'

export const userDao = (input: UserEntity | null) => {
    if (!input) return null
    return {
        toUser(): User {
            const { createdAt, updatedAt, password, ...rest } = input
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
