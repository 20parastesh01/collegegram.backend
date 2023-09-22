import { LikeId, zodLikeId } from '../../postAction/model/like-id'
import { User } from '../../user/model/user'
import { UserId, zodUserId } from '../../user/model/user-id'
import { CreateCommentLike } from '../commentLike.repository'
import { CommentLikeEntity } from '../entity/commentLike.entity'
import { Comment } from '../model/comment'
import { CommentId, zodCommentId } from '../model/comment-id'
import { BasicCommentLike } from '../model/commentLike'

const ToBasicCommentLike = (input: CommentLikeEntity) => {
    const { id, comment_id, user_id } = input
    const ID = id ?? (0 as LikeId)
    const output: BasicCommentLike = {
        id: zodLikeId.parse(ID),
        userId: zodUserId.parse(user_id),
        commentId: zodCommentId.parse(comment_id),
    }
    return output
}
export const commentLikeOrNullDao = (input: CommentLikeEntity | null) => {
    return {
        toCommentLike(): BasicCommentLike | undefined {
            if (input === null) return undefined
            else {
                return ToBasicCommentLike(input)
            }
        },
    }
}
export const commentLikeDao = (input: CommentLikeEntity) => {
    return {
        toCommentLike(): BasicCommentLike {
            return ToBasicCommentLike(input)
        },
    }
}
export const commentLikeArrayDao = (input: CommentLikeEntity[]) => {
    return {
        toCommentLikeList(): BasicCommentLike[] {
            return input.map((entity) => {
                return ToBasicCommentLike(entity)
            })
        },
    }
}
export const toCreateCommentLike = (user: User, comment: Comment): CreateCommentLike => {
    const createCommentLikeEntity: CreateCommentLike = { user: user, comment: comment }
    return createCommentLikeEntity
}
