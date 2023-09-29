import { ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { zodCommentId } from '../../comment/model/comment-id'
import { CommentService, ICommentService } from '../../comment/bll/comment.service'
import { UserService, IUserService } from '../../user/bll/user.service'
import { CommentLikeRepository, ICommentLikeRepository } from '../commentLike.repository'
import { toCreateCommentLike } from './commentLike.dao'

type Message = { msg: Msg }

export interface ICommentLikeService {
    likeComment(userId: UserId, id: JustId): Promise<Message>
    unlikeComment(userId: UserId, id: JustId): Promise<Message | ServerError>
    removeCommentLikesWhenBlockingUser(userId: UserId, targetId: UserId): Promise<Message | ServerError>
}

@Service(CommentLikeRepository, CommentService, UserService)
export class CommentLikeService implements ICommentLikeService {
    constructor(
        private commentLikeRepo: ICommentLikeRepository,
        private commentService: ICommentService,
        private userService: IUserService
    ) {}

    async removeCommentLikesWhenBlockingUser(userId: UserId, targetId: UserId) {
        const commentLikes = await this.commentLikeRepo.getUserLikesOnTargetUserComments(userId, targetId)

        await Promise.all(commentLikes.map(async (commentLike) => {
            const removedCommentLike = (await this.commentLikeRepo.remove(commentLike.id)).toCommentLike()
            if (!removedCommentLike) {
                console.log(`Removing Comment's Like element in remove comment's likes when User block targetUser was not successful. Target CommentLike : :commentLike`, {commentLike})
            }
            return removedCommentLike
        }))

        return { msg: messages.done.persian }
    }
    async likeComment(userId: UserId, id: JustId) {
        const commentId = zodCommentId.parse(id)
        const commentLike = (await this.commentLikeRepo.findByUserAndComment(userId, commentId)).toCommentLike()

        if (commentLike) return { msg: messages.alreadyLiked.persian }

        const user = await this.userService.getUserById(userId)
        const comment = await this.commentService.getComment(id)
        if (user === null || comment === null) return { msg: messages.postNotFound.persian }

        const input = toCreateCommentLike(user, comment)
        const createdCommentLike = (await this.commentLikeRepo.create(input)).toCommentLike()
        return { msg: messages.liked.persian }
    }
    async unlikeComment(userId: UserId, id: JustId) {
        const commentId = zodCommentId.parse(id)
        const commentLike = (await this.commentLikeRepo.findByUserAndComment(userId, commentId)).toCommentLike()
        if (!commentLike) return { msg: messages.notLikedYet.persian }

        const createdCommentLike = (await this.commentLikeRepo.remove(commentLike.id)).toCommentLike()
        if (!createdCommentLike) return new ServerError(PersianErrors.ServerError)

        return { msg: messages.unliked.persian }
    }
}
