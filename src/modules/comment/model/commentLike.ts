import { z } from 'zod'
import { LikeId, zodLikeId } from '../../postAction/model/like-id'
import { UserId, zodUserId } from '../../user/model/user-id'
import { CommentId, zodCommentId } from './comment-id'

export const zodBasicCommentLike = z.object({
    id: zodLikeId,
    userId: zodUserId,
    commentId: zodCommentId,
})
export interface BasicCommentLike {
    id: LikeId
    commentId: CommentId
    userId: UserId
}
