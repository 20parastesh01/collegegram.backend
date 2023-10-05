import { CreateComment } from '../comment.repository'
import { CommentEntity } from '../entity/comment.entity'
import { NewComment, Comment, zodComment } from '../model/comment'
import { CommentId } from '../model/comment-id'

export const toComment = (entity: CommentEntity) => {
    const { updatedAt, author, ...rest } = entity
    const { id, ...comment } = rest
    const ID = id ?? (0 as CommentId)
    const output : Comment = zodComment.parse({id:ID, author: { photo: '', ...author }, ...comment})
    return output
}

export const commentDao = (input: CommentEntity) => {
    return {
        toComment(): Comment {
            return toComment(input)
        },
    }
}
export const commentListDao = (input: CommentEntity[]) => {
    return {
        toCommentList(): Comment[] {
            return input.map((entity) => {
                return toComment(entity)
            })
        },
    }
}
export const commentOrNullDao = (input: CommentEntity | null) => {
    return {
        toComment(): Comment | undefined {
            if (input === null) return undefined
            else {
                return toComment(input)
            }
        },
    }
}

export const toCreateComment = (comment: NewComment): CreateComment => {
    const { parentId, ...rest } = comment
    const createCommentEntity: CreateComment = {
        ...rest,
        parentId,
    }

    return createCommentEntity
}
