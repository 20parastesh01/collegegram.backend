import { UserEntity } from '../entity/user.entity'
import { User } from '../model/user'

export const userEntitytoUser = (input: UserEntity): User => {
    const { createdAt, updatedAt, password, ...rest } = input
    return rest
}
