import { BadRequestError, NotFoundError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { ICommentRepository, CommentRepository } from '../comment.repository'
import { CreateCommentDTO } from '../dto/createComment.dto'
import { Comment } from '../model/comment'
import { toCreateComment } from './comment.dao'
import { UserId } from '../../user/model/user-id'
import { PostId, zodPostId } from '../../post/model/post-id'
import { Service, services } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { IUserService, UserService } from '../../user/bll/user.service'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { CommentId, zodCommentId } from '../model/comment-id'
import { JustId } from '../../../data/just-id'
import { IPostService, PostService } from '../../post/bll/post.service'
import { CommentLikeService } from './commentLike.service'

type arrayResult = { result: Comment[], total: number }
type Message = { msg: Msg }
export interface ICommentService {
    createComment(data: CreateCommentDTO, userId: UserId): Promise<Comment | Message | ServerError>
    getComment(id: JustId): Promise<Comment | null>
    getAllComments(id: JustId, userId: UserId): Promise<arrayResult>
    removeCommentsWhenBlockingUser(userId: UserId, targetId: UserId): Promise<Message | ServerError>
    removeAllRepliesByCommentId(commentId: CommentId): Promise<Comment[]>
}

@Service(CommentRepository, UserService, PostService)
export class CommentService implements ICommentService {
    constructor(
        private commentRepo: ICommentRepository,
        private userService: IUserService,
        private postService: IPostService,
    ) {}

    async removeCommentsWhenBlockingUser(userId: UserId, targetId: UserId) {
        const comments = await this.commentRepo.getUserCommentsOnTargetUserPosts(userId, targetId)

        await Promise.all(comments.map(async (comment) => {
            
            const replies = this.removeAllRepliesByCommentId(comment.id)
            const removedComment = this.commentRepo.remove(comment.id)
            if (!removedComment) {
                console.log(`Removing Comment element in remove comments when User block targetUser was not successful. Target Comment : :comment`, {comment})
            }
            return removedComment
        }))

        return { msg: messages.done.persian }
    }
    async removeAllRepliesByCommentId(commentId: CommentId) {
        const replies = await this.commentRepo.getRepliesCommentByCommentId(commentId)
        await Promise.all(replies.map(async (reply) => {
            
            const removedReply = await this.commentRepo.remove(reply.id)
            if (!removedReply) {
                console.log(`Removing Comment element in remove reply comments when User block targetUser was not successful. Target Comment : :reply`, {reply})
            }
            return removedReply
        }))
        return replies
    }
    async getAllComments(id: JustId, userId: UserId) {
        const postId = zodPostId.parse(id)
        const comments = (await this.commentRepo.findAllByPost(postId))
        
        const commentsWithProfilePhotos = await Promise.all( comments.map(async(comment)=>{
            const like = await (services['CommentLikeService'] as CommentLikeService).getLikeByUserAndComment(userId, comment.id)
            comment.ifLiked = like
            const profilePhoto = await MinioRepo.getProfileUrl(comment.author.id)
            if (profilePhoto) comment.author.photo = profilePhoto
            return comment
        }))
        return { result: commentsWithProfilePhotos , total: comments.length }
    }

    async createComment(dto: CreateCommentDTO, userId: UserId) {
        const{postId, ...rest} = dto
        const user = await this.userService.getUserById(userId)
        const post = await this.postService.getPost(postId, userId)
        if (user === null) return new ServerError(PersianErrors.ServerError)
        if ('msg' in post) return { msg: messages.postNotFound.persian }

        const commentEntity = toCreateComment({
            author: user,
            post: post,
            ...rest,
        })
        const createdComment = (await this.commentRepo.create(commentEntity))
        return createdComment ?? new ServerError()
    }

    async getComment(id: JustId) {
        const commentId = zodCommentId.parse(id)
        const comment = (await this.commentRepo.findByID(commentId))
        return comment ?? null
    }
}
