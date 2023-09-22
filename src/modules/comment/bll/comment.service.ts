import { BadRequestError, NotFoundError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { ICommentRepository, CommentRepository } from '../comment.repository'
import { CreateCommentDTO } from '../dto/createComment.dto'
import { Comment } from '../model/comment'
import { toCreateComment } from './comment.dao'
import { UserId } from '../../user/model/user-id'
import { PostId } from '../../post/model/post-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { IUserService, UserService } from '../../user/bll/user.service'
import { PersianErrors } from '../../../utility/persian-messages'
import { CommentId, zodCommentId } from '../model/comment-id'
import { JustId } from '../../../data/just-id'

type resComment = Comment | BadRequestError | ServerError | NotFoundError
type resComments = { result: Comment[]; total: number } | BadRequestError | ServerError

export interface ICommentService {
    createComment(data: CreateCommentDTO, userId: UserId): Promise<resComment>
    getComment(id: JustId): Promise<Comment | null>
    getAllComments(postId: PostId): Promise<{ result: Comment[]; total: number }>
}

@Service(CommentRepository, UserService)
export class CommentService implements ICommentService {
    constructor(
        private commentRepo: ICommentRepository,
        private userService: IUserService
    ) {}

    async getAllComments(postId: PostId) {
        const comments = (await this.commentRepo.findAllByPost(postId)).toCommentModelList()
        for (let comment of comments) {
            const profilePhoto = await MinioRepo.getProfileUrl(comment.author.id)
            if (profilePhoto) comment.author.photo = profilePhoto
        }
        return { result: comments, total: comments.length }
    }

    async createComment(dto: CreateCommentDTO, userId: UserId) {
        const user = await this.userService.getUserById(userId)
        if (user === null) return new ServerError(PersianErrors.ServerError)
        const commentEntity = toCreateComment({
            author: user,
            ...dto,
        })
        const createdComment = (await this.commentRepo.create(commentEntity)).toCommentModel()
        return createdComment ?? new ServerError()
    }

    async getComment(id: JustId) {
        const commentId = zodCommentId.parse(id)
        const comment = (await this.commentRepo.findByID(commentId)).toCommentModel()
        return comment ?? null
    }
}
