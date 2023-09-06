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

const postEntityToPostModel = (input: PostEntity | PostWithLikesCountEntity) => {
    if (input instanceof  PostEntity) {
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
const postEntityToPostThumbnailModel = (input: PostEntity | PostWithLikesCountEntity) => {
    const { createdAt, updatedAt, likes, ...rest } = input
    const output: BasePost = {
        photosCount: zodWholeNumber.parse(rest.photosCount),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
    }
    return output
}

export const postOrNullDao = (input: PostWithLikesCountEntity | undefined | PostEntity | null) => {
    return {
        toPostModel(): PostWithLikesCount | null | PostWithoutLikesCount {
            if (input === undefined || input === null ) return null
            if (input instanceof  PostEntity) {
                return postEntityToPostModel(input)
            }
            return postEntityToPostModel(input)
        
        },
        toThumbnailModel(): BasePost | null {
            if (input === undefined ||input === null ) return null
            if (input instanceof  PostEntity) {
                return postEntityToPostThumbnailModel(input)
            }
            return postEntityToPostThumbnailModel(input)
        },
    }
}
export const postDao = (input: PostEntity) => {
    return {
        toPostModel(): PostWithLikesCount {
            // Handle the case when input is a single PostEntity
            const rest  = postEntityToPostModel(input)
            const output : PostWithLikesCount = { likesCount:zodWholeNumber.parse(0), ...rest}
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostModelList(): PostWithLikesCount[] {
            // Handle the case when input is an array of PostEntity
            return input.map((entity) => {
                const rest = postEntityToPostModel(entity)
                const output : PostWithLikesCount = { likesCount:zodWholeNumber.parse(0), ...rest}
                return output
            })
        },
        toThumbnailModelList(): BasePost[] {
            // Handle the case when input is an array of PostEntity
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
