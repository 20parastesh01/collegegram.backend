import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { PostWithDetail, PostWithoutDetail, NewPost, BasicPost } from '../model/post'
import { CreatePost } from '../post.repository'
import { zodTags } from '../model/tag'
import { zodUserId } from '../../user/model/user-id'
import { zodCaption } from '../model/caption'
import { zodPostId } from '../model/post-id'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'
import { ZodType, ZodTypeDef, z } from 'zod'
const zodCreatedAt: ZodType<Date, ZodTypeDef, Date> = z.instanceof(Date); //TODO: Generallize it

const postEntityWithDetailToPost = (input: PostEntity) => {
    const { updatedAt, ...rest } = input
    const output: PostWithDetail = {
        id: zodPostId.parse(rest.id),
        caption: zodCaption.parse(rest.caption),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
        tags: zodTags.optional().parse(rest.tags),
        commentCount: zodWholeNumber.parse(rest.commentCount),
        likeCount: zodWholeNumber.parse(rest.likeCount),
        bookmarkCount: zodWholeNumber.parse(rest.bookmarkCount),
        createdAt: zodCreatedAt.parse(rest.createdAt),
    }
    return output
}
const postEntityWithoutDetailToPost = (input: PostEntity) => {
    const { updatedAt, likeCount, bookmarkCount, commentCount, ...rest } = input
    const output: PostWithoutDetail = {
        id: zodPostId.parse(rest.id),
        caption: zodCaption.parse(rest.caption),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
        tags: zodTags.optional().parse(rest.tags),
        createdAt: zodCreatedAt.parse(rest.createdAt),
    }
    return output
}
const postEntityToPostThumbnail = (input: PostEntity | PostEntity) => {
    const { createdAt, updatedAt, ...rest } = input
    const output: BasicPost = {
        id: zodPostId.parse(rest.id),
        author: zodUserId.parse(rest.author),
        closeFriend: zodBooleanOrBooleanString.parse(rest.closeFriend),
    }
    return output
}
export const postWithoutDetailOrNullDao = (input: PostEntity | null) => {
    return {
        toPost(): undefined | PostWithoutDetail {
            if (input === null) return undefined

            return postEntityWithoutDetailToPost(input)
        },
        toThumbnail(): BasicPost | undefined {
            if (input === null) return undefined
            return postEntityToPostThumbnail(input)
        },
    }
}
export const postWithDetailOrNullDao = (input: PostEntity | null) => {
    return {
        toPost(): PostWithDetail | undefined {
            if (input === null) return undefined
            return postEntityWithDetailToPost(input)
        },
        toThumbnail(): BasicPost | undefined {
            if (input === null) return undefined
            return postEntityToPostThumbnail(input)
        },
    }
}
export const postWithoutDetailDao = (input: PostEntity) => {
    return {
        toPost(): PostWithDetail {
            const rest = postEntityWithoutDetailToPost(input)
            const output: PostWithDetail = { likeCount: zodWholeNumber.parse(0), bookmarkCount: zodWholeNumber.parse(0), commentCount: zodWholeNumber.parse(0), ...rest }
            return output
        },
        toPostWithoutDetail(): PostWithoutDetail {
            const rest = postEntityWithoutDetailToPost(input)
            const output: PostWithoutDetail = { ...rest }
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostList(): PostWithDetail[] {
            return input.map((entity) => {
                const rest = postEntityWithDetailToPost(entity)
                const output: PostWithDetail = { ...rest }
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
export const postDaoList = (input: PostEntity[]) => {
    return {
        toPostList(): PostWithoutDetail[] {
            return input.map((entity) => {
                const rest = postEntityWithoutDetailToPost(entity)
                const output: PostWithoutDetail = { ...rest }
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
export const toCreatePost = (post: NewPost): CreatePost => {
    const createPostEntity: CreatePost = { ...post }

    return createPostEntity
}
