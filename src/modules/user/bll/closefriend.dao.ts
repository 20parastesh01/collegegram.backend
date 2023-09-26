import { CloseFriendEntity } from '../entity/closefriend.entity'
import { CloseFriend } from '../model/closefriend'

export const closeFriendDao = (input: CloseFriendEntity | null) => {
    if (!input) return null
    return {
        toCloseFriend(): CloseFriend {
            return input
        },
    }
}
export const CloseFriendListDao = (input: CloseFriendEntity[]) => {
    return {
        toCloseFriendList(): CloseFriend[] {
            return input.map((closeFriend) => closeFriend)
        },
    }
}
