import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { PostWithDetail, PostWithoutDetail, NewPost, BasicPost } from '../model/post'
import { PostWithDetailEntity, CreatePost } from '../post.repository'
import { zodTags } from '../model/tag'
import { zodUserId } from '../../user/model/user-id'
import { zodCaption } from '../model/caption'
import { zodPostId } from '../model/post-id'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

const postEntityWithLikeToPost = (input: PostWithDetailEntity) => {

    const { createdAt, updatedAt, ...rest } = input
        const output: PostWithDetail = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags),
            commentCount: zodWholeNumber.parse(rest.commentCount),
            likeCount: zodWholeNumber.parse(rest.likeCount),
            bookmarkCount: zodWholeNumber.parse(rest.bookmarkCount)
        }
        return output
}
const postEntityWithoutLikeToPost = (input: PostEntity ) => {
        const { createdAt, updatedAt, ...rest } = input
        const output: PostWithoutDetail = {
            id: zodPostId.parse(rest.id),
            caption: zodCaption.parse(rest.caption),
            author: zodUserId.parse(rest.author),
            closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
            tags: zodTags.optional().parse(rest.tags)
        }
        return output
}
const postEntityToPostThumbnail = (input: PostEntity | PostWithDetailEntity) => {
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
        toPost():  undefined | PostWithoutDetail {
            if (input === null ) return undefined

            return postEntityWithoutLikeToPost(input)
        
        },
        toThumbnail(): BasicPost | undefined {
            if (input === null) return undefined
            return postEntityToPostThumbnail(input)
        },
    }
}
export const postWithLikeOrNullDao = (input: PostWithDetailEntity | undefined) => {
    return {
        toPost(): PostWithDetail | undefined  {
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
        toPost(): PostWithDetail {
            const rest  = postEntityWithoutLikeToPost(input)
            const output : PostWithDetail = { likeCount:zodWholeNumber.parse(0),bookmarkCount: zodWholeNumber.parse(0),commentCount: zodWholeNumber.parse(0), ...rest}
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostList(): PostWithDetail[] {
            return input.map((entity) => {
                const rest = postEntityWithoutLikeToPost(entity)
                const output : PostWithDetail = { likeCount:zodWholeNumber.parse(0),bookmarkCount: zodWholeNumber.parse(0),commentCount: zodWholeNumber.parse(0), ...rest}
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
