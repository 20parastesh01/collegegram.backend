import { zodWholeNumber } from '../../../data/whole-number'
import { CreateComment } from '../comment.repository'
import { CommentEntity } from '../entity/comment.entity'
import { NewComment, Comment } from '../model/comment'
import { zodParentId } from '../model/parent-id'

export const commentDao = (input: CommentEntity) => {
    return {
        toCommentModel(): Comment | undefined {
            const { createdAt, updatedAt, ...rest } = input
            return rest
        },
    }
}
export const commentListDao = (input: CommentEntity[]) => {
    return {
        toCommentModelList(): Comment[] {
            // Handle the case when input is an array of PostEntity
            //trow error
            return input.map((entity) => {
                const { createdAt, updatedAt, ...rest } = entity
                return rest
            })
        },
    }
}
export const commentOrNullDao = (input: CommentEntity | null) => {
    return {
        toCommentModel(): Comment | undefined {
            if (!input) return undefined
            else {
                const { createdAt, updatedAt, ...rest } = input
                return rest
            }
        },
    }
}

export const toCreateComment = (comment: NewComment): CreateComment => {
    const { parentId, ...rest } = comment
    const createCommentEntity: CreateComment = {
        likesCount: zodWholeNumber.parse(0), //will not provided in create stage
        ...rest,
        parentId
    }

    return createCommentEntity
}
