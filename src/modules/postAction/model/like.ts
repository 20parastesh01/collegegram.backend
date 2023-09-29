import { z } from 'zod'
import { PostWithDetail, zodStrictPost } from '../../post/model/post'
import { PostId, zodPostId } from '../../post/model/post-id'
import { UserId, zodUserId } from '../../user/model/user-id'
import { LikeId, zodLikeId } from './like-id'

export const zodLikeWithPost = z.object({
    id: zodLikeId,
    post: zodStrictPost,
    userId: zodUserId,
    postId: zodPostId,
})
export const zodBasicLike = z.object({
    id: zodLikeId,
    userId: zodUserId,
    postId: zodPostId,
})
export interface LikeWithPost extends BasicLike {
    post: PostWithDetail
}
export interface BasicLike {
    id: LikeId
    postId: PostId
    userId: UserId
}