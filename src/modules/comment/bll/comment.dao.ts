import { zodUserShort } from '../../user/model/user'
import { CreateComment } from '../comment.repository'
import { CommentEntity } from '../entity/comment.entity'
import { NewComment, Comment } from '../model/comment'
import { CommentId } from '../model/comment-id'

const convertToModel = (entity: CommentEntity): Comment => {
    const { updatedAt, post, likes, author, id, ...rest } = entity
    const ID = id ?? (0 as CommentId)
    return { id: ID, author: zodUserShort.parse({ photo: '', ...author }), ...rest }
}

export const commentDao = (input: CommentEntity) => {
    return {
        toComment(): Comment {
            return convertToModel(input)
        },
    }
}
export const commentListDao = (input: CommentEntity[]) => {
    return {
        toCommentList(): Comment[] {
            return input.map((entity) => {
                return convertToModel(entity)
            })
        },
    }
}
export const commentOrNullDao = (input: CommentEntity | null) => {
    return {
        toComment(): Comment | undefined {
            if (input === null) return undefined
            else {
                return convertToModel(input)
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
