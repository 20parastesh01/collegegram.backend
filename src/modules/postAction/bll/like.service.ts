import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { WholeNumber } from '../../../data/whole-number'
import { ILikeRepository, LikeRepository } from '../like.repository'
import { IUserRepository } from '../../user/user.repository'
import { toCreateLike } from './like.dao'
import { LikeWithPost } from '../model/like'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { IPostRepository } from '../../post/post.repository'
import { PostWithDetail, PostWithoutDetail } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'
  
type arrayResult = { result: PostWithDetail[], total: number }
export type requestedPostId = { requestedPostId: JustId }

export type resMessage = {
    msg: Msg,
    err: BadRequestError[] | ServerError[] | NotFoundError[],
    data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[],
    errCode?: WholeNumber,
}

export interface ILikeService {
    likePost(userId: UserId,id: JustId): Promise<resMessage>
    unlikePost(userId: UserId,id: JustId): Promise<resMessage>
}

@Service(LikeRepository)
export class LikeService implements ILikeService {
    constructor(
        private postRepo: IPostRepository,
        private likeRepo: ILikeRepository,
        private readonly userRepo: IUserRepository
        ) {}
    
    async likePost(userId: UserId, id: JustId) {
        
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId)).toLike();
        if (like)
            return { msg: messages.alreadyLiked.persian , err : [] , data:[{requestedPostId:id}] }

        const user = (await this.userRepo.findById(userId))?.toUser()
        const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
        if(!user || !post)
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }
        
        const input = toCreateLike(user, post)
        const createdLike = (await this.likeRepo.create(input)).toLike()
        const updatedPost = createdLike.post;
        return { msg: messages.liked.persian , err : [] , data:[updatedPost] }
        
    }
    async unlikePost(userId: UserId, id: JustId) {
        
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId)).toLike();
        if (!like) 
            return { msg: messages.notLikedYet.persian , err : [] , data:[{requestedPostId:id}] }

        const createdLike = (await this.likeRepo.remove(like.id)).toLike()
        if(!createdLike)
            return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
        
        const updatedPost = createdLike.post; 
        return  { msg: messages.unliked.persian , err : [] , data:[updatedPost] }
    }
}
