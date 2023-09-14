
import { UserId } from '../../user/model/user-id'
import { LikeId } from './like-id'
import { PostWithDetail } from './post'
import { PostId } from './post-id'

export interface LikeWithPost extends BasicLike {
    post: PostWithDetail
}
export interface BasicLike {
    id:LikeId
    postId: PostId
    userId: UserId
}