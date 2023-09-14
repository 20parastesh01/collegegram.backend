import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { WholeNumber, zodWholeNumber } from '../../../data/whole-number'
import { ILikeRepository } from '../like.repository'
import { IUserRepository } from '../../user/user.repository'
import { likeWithoutIdToCreateLikeEntity } from './like.dao'
import { LikeWithPost } from '../model/like'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { IBookmarkRepository } from '../bookmark.repository'
import { bookmarkWithoutIdToCreateBookmarkEntity } from './bookmark.dao'
import { BookmarkRepository } from '../bookmark.repository'
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

export interface IPostService {
    bookmarkPost(userId: UserId,id: JustId): Promise<resMessage>
    unbookmarkPost(userId: UserId,id: JustId): Promise<resMessage>
}

@Service(BookmarkRepository)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private bookmarkRepo: IBookmarkRepository,
        private readonly userRepo: IUserRepository
        ) {}
    
    async bookmarkPost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark();
        if (!bookmark) {
            const user = (await this.userRepo.findById(userId))?.toUser()
            const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
            if(user && post) {
                const input = bookmarkWithoutIdToCreateBookmarkEntity(user, post)
                const createdBookmark = (await this.bookmarkRepo.create(input)).toBookmark()
                const updatedPost = createdBookmark.post;
                if(createdBookmark !== undefined) return { msg: messages.bookmarked.persian , err : [] , data:[updatedPost] }
                return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
            }
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }
        }
        return { msg: messages.notBookmarkedYet.persian , err : [] , data:[{requestedPostId:id}] }
    }
    async unbookmarkPost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark();
        if (!bookmark) {
            return { msg: messages.notBookmarkedYet.persian , err : [] , data:[{requestedPostId:id}] }
        }
        const createdBookmark = (await this.bookmarkRepo.remove(bookmark.id)).toBookmark()
        if( createdBookmark !== undefined){
            const updatedPost = createdBookmark.post; 
            return  { msg: messages.unbookmarked.persian , err : [] , data:[updatedPost] }
        }
        return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
    }

}
