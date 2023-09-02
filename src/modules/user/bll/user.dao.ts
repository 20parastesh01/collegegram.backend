import { Brand } from '../../../utility/brand'
import { UserEntity } from '../entity/user.entity'
import { User, UserBasic, UserWithPassword } from '../model/user'

export const userDao = (input: UserEntity | null) => {
    if (!input) return null
    return {
        toUser(): User {
            const {  updatedAt, password, ...rest } = input
            return rest
        },
        toUserBasic() {
            const { id: userId, username, name, lastname, photo } = input
            return { userId, username, name, lastname, photo }
        },
        toUserWithPassword() {
            const {  updatedAt, ...rest } = input
            return rest
        }
    }
}