import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { PostWithLikeCount, PostWithoutLikeCount, NewPost, BasePost } from '../model/post'
import { PostWithLikeCountEntity, CreatePost } from '../post.repository'
import { zodTags } from '../model/tag'
import { zodUserId } from '../../user/model/user-id'
import { zodCaption } from '../model/caption'
import { zodPostId } from '../model/post-id'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

const postEntityWithLikeToPostModel = (input: PostWithLikeCountEntity) => {

    const { createdAt, updatedAt, ...rest } = input
        const output: PostWithLikeCount = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            photosCount: zodWholeNumber.parse(rest.photosCount),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags),
            commentsCount: zodWholeNumber.parse(rest.commentsCount),
            likeCount: zodWholeNumber.parse(rest.likeCount)
        }
        return output
}
const postEntityWithoutLikeToPostModel = (input: PostEntity ) => {
        const { createdAt, updatedAt, ...rest } = input
        const output: PostWithoutLikeCount = {
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
const postEntityToPostThumbnailModel = (input: PostEntity | PostWithLikeCountEntity) => {
    const { createdAt, updatedAt, ...rest } = input
    const output: BasePost = {
        photosCount: zodWholeNumber.parse(rest.photosCount),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
    }
    return output
}
export const postWithoutLikeOrNullDao = (input: PostEntity | null) => {
    return {
        toPostModel():  undefined | PostWithoutLikeCount {
            if (input === null ) return undefined

            return postEntityWithoutLikeToPostModel(input)
        
        },
        toThumbnailModel(): BasePost | undefined {
            if (input === null) return undefined
            return postEntityToPostThumbnailModel(input)
        },
    }
}
export const postWithLikeOrNullDao = (input: PostWithLikeCountEntity | undefined) => {
    return {
        toPostModel(): PostWithLikeCount | undefined  {
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
        toPostModel(): PostWithLikeCount {
            const rest  = postEntityWithoutLikeToPostModel(input)
            const output : PostWithLikeCount = { likeCount:zodWholeNumber.parse(0), ...rest}
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostModelList(): PostWithLikeCount[] {
            return input.map((entity) => {
                const rest = postEntityWithoutLikeToPostModel(entity)
                const output : PostWithLikeCount = { likeCount:zodWholeNumber.parse(0), ...rest}
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
        likeCount: zodWholeNumber.parse(0), //will not provided in create stage
        commentsCount: zodWholeNumber.parse(0), //will not provided in create stage
        ...post,
    }

    return createPostEntity
}
