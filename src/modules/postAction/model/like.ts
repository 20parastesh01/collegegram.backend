
import { PostWithDetail } from '../../post/model/post'
import { PostId } from '../../post/model/post-id'
import { UserId } from '../../user/model/user-id'
import { LikeId } from './like-id'

export interface LikeWithPost extends BasicLike {
    post: PostWithDetail
}
export interface BasicLike {
    id:LikeId
    postId: PostId
    userId: UserId
}