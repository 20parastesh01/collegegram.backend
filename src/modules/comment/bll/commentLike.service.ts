import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { Comment } from '../model/comment'
import { zodCommentId } from '../../comment/model/comment-id'
import { CommentService, ICommentService } from '../../comment/bll/comment.service'
import { UserService, IUserService } from '../../user/bll/user.service'
import { CommentLikeRepository, ICommentLikeRepository } from '../commentLike.repository'
import { toCreateCommentLike } from './commentLike.dao'
  
type arrayResult = { result: Comment[], total: number }
type Message = {msg: Msg }
export type resMessage =  Message | arrayResult | BadRequestError | ServerError | NotFoundError 
// {
//     msg: Msg,
//     err: BadRequestError[] | ServerError[] | NotFoundError[],
//     data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[],
//     errCode?: WholeNumber,
// }

export interface ICommentLikeService {
    likeComment(userId: UserId,id: JustId): Promise<resMessage>
    unlikeComment(userId: UserId,id: JustId): Promise<resMessage>
}

@Service(CommentLikeRepository, CommentService, UserService)
export class CommentLikeService implements ICommentLikeService {
    constructor(
        private commentLikeRepo: ICommentLikeRepository,
        private commentService : ICommentService,
        private userService: IUserService,
        ) {}
    
    async likeComment(userId: UserId, id: JustId) {
        
        const commentId = zodCommentId.parse(id)
        const commentLike = (await this.commentLikeRepo.findByUserAndComment(userId, commentId)).toCommentLike();

        if (commentLike)
            return { msg: messages.alreadyLiked.persian }

        const user = (await this.userService.getUserById(userId))
        const comment = (await this.commentService.getComment(id))
        if(user === null || comment === null)
            return { msg: messages.postNotFound.persian }
        
        const input = toCreateCommentLike(userId, comment)
        const createdCommentLike = (await this.commentLikeRepo.create(input)).toCommentLike()
        return { msg: messages.liked.persian }
        
    }
    async unlikeComment(userId: UserId, id: JustId) {
        
        const commentId = zodCommentId.parse(id)
        const commentLike = (await this.commentLikeRepo.findByUserAndComment(userId, commentId)).toCommentLike();
        if (!commentLike) 
            return { msg: messages.notLikedYet.persian }

        const createdCommentLike = (await this.commentLikeRepo.remove(commentLike.id)).toCommentLike()
        if(!createdCommentLike)
            return new ServerError(PersianErrors.ServerError) 
         
        return  { msg: messages.unliked.persian }
    }
}
