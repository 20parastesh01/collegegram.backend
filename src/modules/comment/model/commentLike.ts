import { LikeId } from '../../postAction/model/like-id'
import { UserId } from '../../user/model/user-id'
import { CommentId } from './comment-id'

export interface BasicCommentLike {
    id:LikeId
    commentId: CommentId
    userId: UserId
}