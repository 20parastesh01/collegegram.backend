import { LikeEntity } from '../entity/like.entity'
import { CreateLike } from '../like.repository'
import { zodUserId } from '../../user/model/user-id'
import { zodPostId } from '../model/post-id'
import { LikeId, zodLikeId } from '../model/like-id'
import { PostWithoutLikeCount } from '../model/post'
import { User } from '../../user/model/user'
import { zodWholeDate } from '../../../data/whole-date'
import { LikeWithId } from '../model/like'
const likeEntityToLikeModel = (input: LikeEntity) => {
    const { id, post, user } = input
    const output: LikeWithId = {
        id: zodLikeId.parse(id),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
export const likeOrNullDao = (input: LikeEntity | null) => {
    return {
        toLikeModel(): LikeWithId | undefined {
            if (input === null) return undefined
            else {
                return likeEntityToLikeModel(input)
            }
        },
        toLikeWithDatesModel(): LikeWithId | undefined {
            if (input === null) return undefined
            else {
                return likeEntityToLikeModel(input)
            }
        }
    }
}
export const likeDao = (input: LikeEntity) => {
    return {
        toLikeModel(): LikeWithId {
            return likeEntityToLikeModel(input)
        },
    }
}
export const likeArrayDao = (input: LikeEntity[]) => {
    return {
        toLikeModelList(): LikeWithId[] {
            return input.map((entity) => {
                return likeEntityToLikeModel(entity)
            })
        }
    }
}
export const likeWithoutIdModelToCreateLikeEntity = (user: User, post: PostWithoutLikeCount ): CreateLike => {
    const createLikeEntity: CreateLike = { user: user, post: post }
    return createLikeEntity
}
