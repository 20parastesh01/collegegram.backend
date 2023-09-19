import { zodLikeId } from '../../postAction/model/like-id'
import { UserId, zodUserId } from '../../user/model/user-id'
import { CreateCommentLike } from '../commentLike.repository'
import { CommentLikeEntity } from '../entity/commentLike.entity'
import { Comment } from '../model/comment'
import { zodCommentId } from '../model/comment-id'
import { BasicCommentLike } from '../model/commentLike'

const ToBasicCommentLike = (input: CommentLikeEntity) => {
    const { id, comment, user } = input
    const output: BasicCommentLike = {
        id: zodLikeId.parse(id),
        userId: zodUserId.parse(user),
        commentId: zodCommentId.parse(comment),
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
        }
    }
}
export const commentLikeDao = (input: CommentLikeEntity) => {
    return {
        toCommentLike(): BasicCommentLike {
            return ToBasicCommentLike(input)
        }
    }
}
export const commentLikeArrayDao = (input: CommentLikeEntity[]) => {
    return {
        toCommentLikeList(): BasicCommentLike[] {
            return input.map((entity) => {
                return ToBasicCommentLike(entity)
            })
        }
    }
}
export const toCreateCommentLike = (user: UserId, comment: Comment ): CreateCommentLike => {
    const createCommentLikeEntity: CreateCommentLike = { user: user, comment: comment }
    return createCommentLikeEntity
}
