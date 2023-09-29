import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { PostWithDetail, PostWithoutDetail, NewPost, BasicPost, zodStrictPost, zodBasicPost, zodPost } from '../model/post'
import { CreatePost } from '../post.repository'
import { zodTags } from '../model/tag'
import { zodUserId } from '../../user/model/user-id'
import { zodCaption } from '../model/caption'
import { zodPostId } from '../model/post-id'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'
import { ZodType, ZodTypeDef, z } from 'zod'
const zodCreatedAt: ZodType<Date, ZodTypeDef, Date> = z.instanceof(Date); //TODO: Generallize it

const toPostWithDetail = (input: PostEntity): PostWithDetail => {
    const { createdAt, updatedAt, ...rest } = input;
    return zodStrictPost.parse(rest);
}

const toPostWithoutDetail = (input: PostEntity): PostWithoutDetail => {
    const { createdAt, updatedAt, likeCount, bookmarkCount, commentCount, ...rest } = input;
    return zodPost.parse(rest);
}

const toBasicPost = (input: PostEntity): BasicPost => {
    const { createdAt, updatedAt, likeCount, bookmarkCount, commentCount, ...rest } = input;
    return zodBasicPost.parse(rest);
}

export const postWithoutDetailOrNullDao = (input: PostEntity | null) => {
    return {
        toPost(): undefined | PostWithoutDetail {
            if (input === null) return undefined

            return toPostWithoutDetail(input)
        },
        toThumbnail(): BasicPost | undefined {
            if (input === null) return undefined
            return toBasicPost(input)
        },
    }
}
export const postWithDetailOrNullDao = (input: PostEntity | null) => {
    return {
        toPost(): PostWithDetail | undefined {
            if (input === null) return undefined
            return toPostWithDetail(input)
        },
        toThumbnail(): BasicPost | undefined {
            if (input === null) return undefined
            return toBasicPost(input)
        },
    }
}
export const postWithoutDetailDao = (input: PostEntity) => {
    return {
        toPost(): PostWithDetail {
            const rest = toPostWithoutDetail(input)
            const output: PostWithDetail = { likeCount: zodWholeNumber.parse(0), bookmarkCount: zodWholeNumber.parse(0), commentCount: zodWholeNumber.parse(0), ...rest }
            return output
        },
        toPostWithoutDetail(): PostWithoutDetail {
            const rest = toPostWithoutDetail(input)
            const output: PostWithoutDetail = { ...rest }
            return output
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostList(): PostWithDetail[] {
            return input.map((entity) => {
                const rest = toPostWithDetail(entity)
                const output: PostWithDetail = { ...rest }
                return output
            })
        },
        toThumbnailList(): BasicPost[] {
            return input.map((entity) => {
                const rest = toBasicPost(entity)
                return rest
            })
        },
    }
}
export const postDaoList = (input: PostEntity[]) => {
    return {
        toPostList(): PostWithoutDetail[] {
            return input.map((entity) => {
                const rest = toPostWithoutDetail(entity)
                const output: PostWithoutDetail = { ...rest }
                return output
            })
        },
        toThumbnailList(): BasicPost[] {
            return input.map((entity) => {
                const rest = toBasicPost(entity)
                return rest
            })
        },
    }
}
export const toCreatePost = (post: NewPost): CreatePost => {
    const createPostEntity: CreatePost = { ...post }

    return createPostEntity
}
