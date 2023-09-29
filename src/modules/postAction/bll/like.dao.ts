import { LikeEntity } from '../entity/like.entity'
import { CreateLike } from '../like.repository'
import { zodUserId } from '../../user/model/user-id'
import { LikeId, zodLikeId } from '../model/like-id'
import { User } from '../../user/model/user'
import { BasicLike, LikeWithPost, zodBasicLike, zodLikeWithPost } from '../model/like'
import { PostWithDetail, zodStrictPost } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'

const ToLikeWithPost = (input: LikeEntity) => {
    const { id, ...rest } = input
    const ID = id ?? (0 as LikeId)
    const output: LikeWithPost = zodLikeWithPost.parse({id:ID, ...rest})
    return output
}
const toBasicLike = (input: LikeEntity) => {
    const { id, ...rest } = input
    const ID = id ?? (0 as LikeId)
    const output: BasicLike = zodBasicLike.parse({id:ID, ...rest})
    return output
}
export const likeOrNullDao = (input: LikeEntity | null) => {
    return {
        toLike(): LikeWithPost | undefined {
            if (input === null) return undefined
            else {
                return ToLikeWithPost(input)
            }
        },
    }
}
export const likeDao = (input: LikeEntity) => {
    return {
        toLike(): LikeWithPost {
            return ToLikeWithPost(input)
        },
    }
}
export const likeArrayDao = (input: LikeEntity[]) => {
    return {
        toLikeList(): LikeWithPost[] {
            return input.map((entity) => {
                return ToLikeWithPost(entity)
            })
        },
    }
}
export const toCreateLike = (user: User, post: PostWithDetail): CreateLike => {
    const { photos, ...rest } = post
    const createLikeEntity: CreateLike = { user: user, post: rest }
    return createLikeEntity
}
