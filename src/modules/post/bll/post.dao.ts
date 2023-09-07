import { z } from 'zod'
import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { PostWithLikesCount, PostWithoutLikesCount, NewPost, BasePost } from '../model/post'
import { PostWithLikesCountEntity, CreatePost } from '../post.repository'
import { zodTags } from '../model/tag'
import { zodUserId } from '../../user/model/user-id'
import { zodCaption } from '../model/caption'
import { zodPostId } from '../model/post-id'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

const postEntityWithLikeToPostModel = (input: PostWithLikesCountEntity) => {

    const { createdAt, updatedAt, likes, ...rest } = input
        const output: PostWithLikesCount = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            photosCount: zodWholeNumber.parse(rest.photosCount),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags),
            commentsCount: zodWholeNumber.parse(rest.commentsCount),
            likesCount: zodWholeNumber.parse(rest.likesCount)
        }
        return output
}
const postEntityWithoutLikeToPostModel = (input: PostEntity ) => {
        const { createdAt, updatedAt, likes, ...rest } = input
        const output: PostWithoutLikesCount = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            photosCount: zodWholeNumber.parse(rest.photosCount),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags),
            commentsCount: zodWholeNumber.parse(rest.commentsCount)
        }
        return output
}
const postEntityToPostThumbnailModel = (input: PostEntity | PostWithLikesCountEntity) => {
    const { createdAt, updatedAt, likes, ...rest } = input
    const output: BasePost = {
        photosCount: zodWholeNumber.parse(rest.photosCount),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
    }
    return output
}
export const postWithoutLikeOrNullDao = (input: PostEntity | null) => {
    return {
        toPostModel():  undefined | PostWithoutLikesCount {
            if (input === null ) return undefined

            return postEntityWithoutLikeToPostModel(input)
        
        },
        toThumbnailModel(): BasePost | undefined {
            if (input === null) return undefined
            return postEntityToPostThumbnailModel(input)
        },
    }
}
export const postWithLikeOrNullDao = (input: PostWithLikesCountEntity | undefined) => {
    return {
        toPostModel(): PostWithLikesCount | undefined  {
            if (input === undefined ) return undefined
            return postEntityWithLikeToPostModel(input)
        
        },
        toThumbnailModel(): BasePost | undefined {
            if (input === undefined ) return undefined
            return postEntityToPostThumbnailModel(input)
        },
    }
}
export const postWithoutLikeDao = (input: PostEntity) => {
    return {
        toPostModel(): PostWithLikesCount {
            const rest  = postEntityWithoutLikeToPostModel(input)
            const output : PostWithLikesCount = { likesCount:zodWholeNumber.parse(0), ...rest}
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostModelList(): PostWithLikesCount[] {
            return input.map((entity) => {
                const rest = postEntityWithoutLikeToPostModel(entity)
                const output : PostWithLikesCount = { likesCount:zodWholeNumber.parse(0), ...rest}
                return output
            })
        },
        toThumbnailModelList(): BasePost[] {
            return input.map((entity) => {
                const rest = postEntityToPostThumbnailModel(entity)
                return rest
            })
        },
    }
}
export const newPostModelToRepoInput = (post: NewPost): CreatePost => {
    const createPostEntity: CreatePost = {
        likesCount: zodWholeNumber.parse(0), //will not provided in create stage
        commentsCount: zodWholeNumber.parse(0), //will not provided in create stage
        ...post,
    }

    return createPostEntity
}
