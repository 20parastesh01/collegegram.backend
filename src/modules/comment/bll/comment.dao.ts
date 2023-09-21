import { zodWholeNumber } from '../../../data/whole-number'
import { zodUserShort } from '../../user/model/user'
import { CreateComment } from '../comment.repository'
import { CommentEntity } from '../entity/comment.entity'
import { NewComment, Comment } from '../model/comment'

const convertToModel = (entity: CommentEntity) => {
    const { updatedAt, author, ...rest } = entity
    return { author: zodUserShort.parse({ photo: '', ...author }), ...rest }
}

export const commentDao = (input: CommentEntity) => {
    return {
        toCommentModel(): Comment | undefined {
            const { updatedAt, author, ...rest } = input
            return { author: zodUserShort.parse({ photo: '', ...author }), ...rest }
        },
    }
}
export const commentListDao = (input: CommentEntity[]) => {
    return {
        toCommentModelList(): Comment[] {
            // Handle the case when input is an array of PostEntity
            //trow error
            return input.map((entity) => {
                return convertToModel(entity)
            })
        },
    }
}
export const commentOrNullDao = (input: CommentEntity | null) => {
    return {
        toCommentModel(): Comment | undefined {
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
