import { LikeEntity } from '../entity/like.entity'
import { Like, LikeWithDates } from '../model/like'
import { CreateLike, CreatedLike } from '../like.repository'
import { zodUserId } from '../../user/model/user-id'
import { zodPostId } from '../model/post-id'
import { LikeId, zodLikeId } from '../model/like-id'
import { PostWithoutLikesCount } from '../model/post'
import { User } from '../../user/model/user'
import { zodWholeDate } from '../../../data/whole-date'
const likeEntityToLikeModel = (input: LikeEntity) => {
    const { id, post, user } = input
    const output: Like = {
        id: zodLikeId.parse(id),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
const likeEntityToLikeWithDatesModel = (input: LikeEntity) => {
    const baseLike = likeEntityToLikeModel(input)
    const output: LikeWithDates = {
        ...baseLike,
        createdAt:zodWholeDate.parse(input.createdAt),
        updatedAt:zodWholeDate.parse(input.updatedAt),
    }
    return output
}
export const likeOrNullDao = (input: LikeEntity | null) => {
    return {
        toLikeModel(): Like | undefined {
            if (input === null) return undefined
            else {
                return likeEntityToLikeModel(input)
            }
        },
        toLikeWithDatesModel(): LikeWithDates | undefined {
            if (input === null) return undefined
            else {
                return likeEntityToLikeWithDatesModel(input)
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
export const likeWithoutIdModelToCreateLikeEntity = (user: User, post: PostWithoutLikesCount ): CreateLike => {
    const createLikeEntity: CreateLike = { user: user, post: post }
    return createLikeEntity
}
export const likeModelToFullEntity = (id: LikeId,user: User, post: PostWithoutLikesCount ): CreatedLike => {
    const createLikeEntity: CreatedLike = {id: id, user: user, post: post }
    return createLikeEntity
}
