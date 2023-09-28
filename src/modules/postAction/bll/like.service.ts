import { ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { ILikeRepository, LikeRepository } from '../like.repository'
import { toCreateLike } from './like.dao'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { zodPostId } from '../../post/model/post-id'
import { PostService, IPostService } from '../../post/bll/post.service'
import { UserService, IUserService } from '../../user/bll/user.service'

type Message = { msg: Msg }

export interface ILikeService {
    likePost(userId: UserId, id: JustId): Promise<Message>
    unlikePost(userId: UserId, id: JustId): Promise<Message | ServerError>
    removeLikesWhenBlockingUser(userId: UserId, targetId: UserId): Promise<Message | ServerError>
}

@Service(LikeRepository, PostService, UserService)
export class LikeService implements ILikeService {
    constructor(
        private likeRepo: ILikeRepository,
        private postService: IPostService,
        private userService: IUserService
    ) {}

    async likePost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId)).toLike()
        if (like) return { msg: messages.alreadyLiked.persian }

        const user = await this.userService.getUserById(userId)
        const post = await this.postService.getPost(id, userId)
        if (user === null || 'msg' in post) return { msg: messages.postNotFound.persian }

        const input = toCreateLike(user, post)
        await this.likeRepo.create(input)
        
        return { msg: messages.liked.persian }
    }
    async unlikePost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId)).toLike()
        if (!like) return { msg: messages.notLikedYet.persian }

        const post = await this.postService.getPost(id, userId)
        if('msg' in post) return { msg: messages.postNotFound.persian }

        const removedLike = (await this.likeRepo.remove(like.id)).toLike()
        if (!removedLike) return new ServerError(PersianErrors.ServerError)

        return { msg: messages.unliked.persian }
    }
    async removeLikesWhenBlockingUser(userId: UserId, targetId: UserId) {
        const likes = await this.likeRepo.getUserLikesOnTargetUserPosts(userId, targetId)

        await Promise.all(likes.map(async (like) => {
            const removedLike = (await this.likeRepo.remove(like.id)).toLike()
            if (!removedLike) {
                console.log(`Remove Like element in remove likes when User block was not successful. Target Like : :like`, {like})
            }
            return removedLike
        }))

        return { msg: messages.done.persian }
    }
}
