import { BadRequestError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { ICommentRepository, CommentRepository } from '../comment.repository'
import { Service } from '../../../registry'
import { CreateCommentDTO } from '../dto/createComment.dto'
import { Comment } from '../model/comment'
import { CommentEntity } from '../entity/comment.entity'
import { CommentId } from '../model/comment-id'
import { newCommentModelToEntity, toCommentModel } from './comment.dao'
import { UserId } from '../../user/model/user-id'
import { PostId } from '../../post/model/post-id'

type GetCreateComment = Comment | BadRequestError | ServerError

export interface ICommentService {
  createComment(data: CreateCommentDTO): Promise<GetCreateComment>
  //getComment(commentId: CommentId): Promise<Comment | null>;
  getAllComments(postId: PostId): Promise<Comment[] | null>;
}

@Service(CommentRepository)
export class CommentService implements ICommentService {
  constructor(private commentRepo: ICommentRepository) { }

  getAllComments(postId: PostId): Promise<Comment[] | null> {
    return this.commentRepo.findAllByPost(postId);
  }

  async createComment(dto: CreateCommentDTO): Promise<CommentEntity> {
    const { parentId, content, postId, author} = dto;
    const commentEntity = newCommentModelToEntity({
      parentId, content, postId, author
    })
    const createdComment = await this.commentRepo.create(commentEntity);
    return createdComment;
  }

  // async getComment(commentId: CommentId): Promise<Comment | null> {
  //   const commentEntity = await this.commentRepo.findByID(commentId);
  //   if (commentEntity) {
  //     return toCommentModel(commentEntity);
  //   }
  //   return null;
  // }
}
