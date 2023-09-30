import { ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { ILikeRepository, LikeRepository } from '../like.repository'
import { toCreateLike } from './like.dao'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { PostId, zodPostId } from '../../post/model/post-id'
import { PostService, IPostService } from '../../post/bll/post.service'
import { UserService, IUserService } from '../../user/bll/user.service'

type Message = { msg: Msg }

export interface ILikeService {
    likePost(userId: UserId, id: JustId): Promise<Message | ServerError>
    unlikePost(userId: UserId, id: JustId): Promise<Message | ServerError>
    removePostLikesWhenBlockingUser(userId: UserId, targetId: UserId): Promise<Message | ServerError>
    getLikeByUserAndPost(userId: UserId, postId: PostId): Promise<boolean>
}

@Service(LikeRepository, PostService, UserService)
export class LikeService implements ILikeService {
    constructor(
        private likeRepo: ILikeRepository,
        private postService: IPostService,
        private userService: IUserService
    ) {}
    
    async getLikeByUserAndPost(userId: UserId, postId: PostId): Promise<boolean> {
        const like = (await this.likeRepo.findByUserAndPost(userId, postId))
        if (like) return true
        return false
    }

    async likePost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId))
        if (like) return { msg: messages.alreadyLiked.persian }

        const user = await this.userService.getUserById(userId)
        const post = await this.postService.getPost(id, userId)
        if (user === null) return new ServerError(PersianErrors.ServerError)
        if ('msg' in post) return { msg: messages.postNotFound.persian }

        const input = toCreateLike(user, post)
        await this.likeRepo.create(input)
        
        return { msg: messages.liked.persian }
    }
    async unlikePost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId))
        if (!like) return { msg: messages.notLikedYet.persian }

        const post = await this.postService.getPost(id, userId)
        if('msg' in post) return { msg: messages.postNotFound.persian }

        const removedLike = (await this.likeRepo.remove(like.id))
        if (!removedLike) return new ServerError(PersianErrors.ServerError)

        return { msg: messages.unliked.persian }
    }
    async removePostLikesWhenBlockingUser(userId: UserId, targetId: UserId) {
        const postLikes = await this.likeRepo.getUserLikesOnTargetUserPosts(userId, targetId)

        await Promise.all(postLikes.map(async (postLike) => {
            const removedLike = (await this.likeRepo.remove(postLike.id))
            if (!removedLike) {
                console.log(`Remove Post's Like element in remove post's likes when User block targetUser was not successful. Target PostLike : :postLike`, {postLike})
            }
            return removedLike
        }))

        return { msg: messages.done.persian }
    }
}
