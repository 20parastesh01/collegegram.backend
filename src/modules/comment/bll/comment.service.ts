import { BadRequestError, NotFoundError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { ICommentRepository, CommentRepository } from '../comment.repository'
import { CreateCommentDTO } from '../dto/createComment.dto'
import { Comment } from '../model/comment'
import { CommentEntity } from '../entity/comment.entity'
import { CommentId } from '../model/comment-id'
import { newCommentModelToRepoInput } from './comment.dao'
import { UserId } from '../../user/model/user-id'
import { PostId } from '../../post/model/post-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'

type resComment = Comment | BadRequestError | ServerError | NotFoundError
type resComments = { result: Comment[]; total: number } | BadRequestError | ServerError

export interface ICommentService {
    createComment(data: CreateCommentDTO, userId: UserId): Promise<resComment>
  //getComment(commentId: CommentId): Promise<Comment | null>;
    getAllComments(postId: PostId): Promise<resComments>
}

@Service(CommentRepository)
export class CommentService implements ICommentService {
    constructor(private commentRepo: ICommentRepository) {}

    async getAllComments(postId: PostId): Promise<resComments> {
        const comments = (await this.commentRepo.findAllByPost(postId)).toCommentModelList()
        for (let comment of comments) {
            const profilePhoto = await MinioRepo.getProfileUrl(comment.author)
            if (profilePhoto) comment.authorProfile = profilePhoto
        }
        return { result: comments, total: comments.length }
  }

  async createComment(dto: CreateCommentDTO, userId: UserId): Promise<resComment> {
    const { parentId, content, postId} = dto;
    const commentEntity = newCommentModelToRepoInput({
      parentId, content, postId, author: userId
    })
        const createdComment = (await this.commentRepo.create(commentEntity)).toCommentModel()
        return createdComment ?? new ServerError()
  }

  // async getComment(commentId: CommentId): Promise<Comment | null> {
  //   const commentEntity = await this.commentRepo.findByID(commentId);
  //   if (commentEntity) {
  //     return toCommentModel(commentEntity);
  //   }
  //   return null;
  // }
}
