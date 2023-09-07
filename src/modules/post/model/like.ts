
import { UserId } from '../../user/model/user-id'
import { LikeId } from './like-id'
import { PostId } from './post-id'

export interface LikeWithId extends LikeWithoutId {
    id: LikeId
}
export interface LikeWithoutId {
    postId: PostId
    userId: UserId
}