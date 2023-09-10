import { LikeEntity } from '../entity/like.entity'
import { CreateLike } from '../like.repository'
import { zodUserId } from '../../user/model/user-id'
import { zodPostId } from '../model/post-id'
import { zodLikeId } from '../model/like-id'
import { PostWithoutLikeCount, zodStrictPost } from '../model/post'
import { User } from '../../user/model/user'
import { BasicLike , LikeWithPost } from '../model/like'

const likeEntityToLike = (input: LikeEntity) => {
    const { id, post, user } = input
    const output: LikeWithPost = {
        id: zodLikeId.parse(id),
        post: zodStrictPost.parse(post),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
const likeEntityToBasicLike = (input: LikeEntity) => {
    const { id, post, user } = input
    const output: BasicLike = {
        id: zodLikeId.parse(id),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
export const likeOrNullDao = (input: LikeEntity | null) => {
    return {
        toLike(): LikeWithPost | undefined {
            if (input === null) return undefined
            else {
                return likeEntityToLike(input)
            }
        },
        toLikeWithDates(): LikeWithPost | undefined {
            if (input === null) return undefined
            else {
                return likeEntityToLike(input)
            }
        }
    }
}
export const likeDao = (input: LikeEntity) => {
    return {
        toLike(): LikeWithPost {
            return likeEntityToLike(input)
        }
    }
}
export const likeArrayDao = (input: LikeEntity[]) => {
    return {
        toLikeList(): LikeWithPost[] {
            return input.map((entity) => {
                return likeEntityToLike(entity)
            })
        }
    }
}
export const likeWithoutIdToCreateLikeEntity = (user: User, post: PostWithoutLikeCount ): CreateLike => {
    const createLikeEntity: CreateLike = { user: user, post: post }
    return createLikeEntity
}
