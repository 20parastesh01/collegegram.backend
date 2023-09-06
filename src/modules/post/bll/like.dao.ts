import { LikeEntity } from '../entity/like.entity'
import { Like } from '../model/like'
import { CreateLike } from '../like.repository'
import { zodUserId } from '../../user/model/user-id'
import { zodPostId } from '../model/post-id'
import { zodLikeId } from '../model/like-id'
import { PostWithLikesCount, PostWithoutLikesCount } from '../model/post'
import { User } from '../../user/model/user'
const likeEntityToLikeModel = (input: LikeEntity) => {
    const { id, post, user, ...rest } = input
    const output: Like = {
        id: zodLikeId.parse(id),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id)
    }
    return output
}
export const likeOrNullDao = (input: LikeEntity | null) => {
    return {
        toLikeModel(): Like | null {
            if (input === null) return null
            else {
                return likeEntityToLikeModel(input)
            }
        }
    }
}
export const likeDao = (input: LikeEntity) => {
    return {
        toLikeModel(): Like {
            return likeEntityToLikeModel(input)
        },
    }
}
export const likeArrayDao = (input: LikeEntity[]) => {
    return {
        toLikeModelList(): Like[] {
            return input.map((entity) => {
                return likeEntityToLikeModel(entity)
            })
        }
    }
}
export const likeWithoutIdModelToRepoInput = (user: User, post: PostWithoutLikesCount | PostWithLikesCount): CreateLike => {
    const createLikeEntity: CreateLike = { user: user, post: post }
    return createLikeEntity
}
