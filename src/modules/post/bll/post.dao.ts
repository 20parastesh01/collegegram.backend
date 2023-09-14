import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { PostWithLikeCount, PostWithoutLikeCount, NewPost, BasicPost } from '../model/post'
import { PostWithLikeCountEntity, CreatePost } from '../post.repository'
import { zodTags } from '../model/tag'
import { zodUserId } from '../../user/model/user-id'
import { zodCaption } from '../model/caption'
import { zodPostId } from '../model/post-id'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

const postEntityWithLikeToPost = (input: PostWithLikeCountEntity) => {

    const { createdAt, updatedAt, ...rest } = input
        const output: PostWithLikeCount = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags),
            commentCount: zodWholeNumber.parse(rest.commentCount),
            likeCount: zodWholeNumber.parse(rest.likeCount)
        }
        return output
}
const postEntityWithoutLikeToPost = (input: PostEntity ) => {
        const { createdAt, updatedAt, ...rest } = input
        const output: PostWithoutLikeCount = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags),
            commentCount: zodWholeNumber.parse(rest.commentCount)
        }
        return output
}
const postEntityToPostThumbnail = (input: PostEntity | PostWithLikeCountEntity) => {
    const { createdAt, updatedAt, ...rest } = input
    const output: BasicPost = {
        id: zodPostId.parse(rest.id),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
    }
    return output
}
export const postWithoutLikeOrNullDao = (input: PostEntity | null) => {
    return {
        toPost():  undefined | PostWithoutLikeCount {
            if (input === null ) return undefined

            return postEntityWithoutLikeToPost(input)
        
        },
        toThumbnail(): BasicPost | undefined {
            if (input === null) return undefined
            return postEntityToPostThumbnail(input)
        },
    }
}
export const postWithLikeOrNullDao = (input: PostWithLikeCountEntity | undefined) => {
    return {
        toPost(): PostWithLikeCount | undefined  {
            if (input === undefined ) return undefined
            return postEntityWithLikeToPost(input)
        
        },
        toThumbnail(): BasicPost | undefined {
            if (input === undefined ) return undefined
            return postEntityToPostThumbnail(input)
        },
    }
}
export const postWithoutLikeDao = (input: PostEntity) => {
    return {
        toPost(): PostWithLikeCount {
            const rest  = postEntityWithoutLikeToPost(input)
            const output : PostWithLikeCount = { likeCount:zodWholeNumber.parse(0), ...rest}
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostList(): PostWithLikeCount[] {
            return input.map((entity) => {
                const rest = postEntityWithoutLikeToPost(entity)
                const output : PostWithLikeCount = { likeCount:zodWholeNumber.parse(0), ...rest}
                return output
            })
        },
        toThumbnailList(): BasicPost[] {
            return input.map((entity) => {
                const rest = postEntityToPostThumbnail(entity)
                return rest
            })
        },
    }
}
export const newPostToRepoInput = (post: NewPost): CreatePost => {
    const createPostEntity: CreatePost = {
        likeCount: zodWholeNumber.parse(0), //will not provided in create stage
        commentCount: zodWholeNumber.parse(0), //will not provided in create stage
        ...post,
    }

    return createPostEntity
}
