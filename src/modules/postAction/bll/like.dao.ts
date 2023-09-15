import { LikeEntity } from '../entity/like.entity'
import { CreateLike } from '../like.repository'
import { zodUserId } from '../../user/model/user-id'
import { zodLikeId } from '../model/like-id'
import { User } from '../../user/model/user'
import { BasicLike , LikeWithPost } from '../model/like'
import { zodStrictPost, PostWithoutDetail } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'

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
export const toCreateLike = (user: User, post: PostWithoutDetail ): CreateLike => {
    const createLikeEntity: CreateLike = { user: user, post: post }
    return createLikeEntity
}
