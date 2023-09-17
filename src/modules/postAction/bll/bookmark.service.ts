import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { WholeNumber } from '../../../data/whole-number'
import { IUserRepository } from '../../user/user.repository'
import { LikeWithPost } from '../model/like'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { BookmarkRepository, IBookmarkRepository } from '../bookmark.repository'
import { toCreateBookmark } from './bookmark.dao'
import { IPostRepository } from '../../post/post.repository'
import { PostWithDetail, PostWithoutDetail } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'
  
type arrayResult = { result: PostWithDetail[], total: number }
export type requestedPostId = { requestedPostId: JustId }
type Message = {msg: Msg }
export type resMessage = Message | BadRequestError| ServerError| NotFoundError| PostWithDetail| PostWithoutDetail| LikeWithPost | arrayResult 
// {
//     msg: Msg,
//     err: BadRequestError[] | ServerError[] | NotFoundError[],
//     data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[],
//     errCode?: WholeNumber,
//}

export interface IBookmarkService {
    bookmarkPost(userId: UserId,id: JustId): Promise<resMessage>
    unbookmarkPost(userId: UserId,id: JustId): Promise<resMessage>
    getMyBookmarkeds(userId: UserId): Promise<resMessage>
}

@Service(BookmarkRepository)
export class BookmarkService implements IBookmarkService {
    constructor(
        private postRepo: IPostRepository,
        private bookmarkRepo: IBookmarkRepository,
        private readonly userRepo: IUserRepository
        ) {}

    async getMyBookmarkeds(userId: UserId): Promise<resMessage> {

        const result = (await this.bookmarkRepo.findAllByUser(userId)).toBookmarkList()
        if(result.length < 1)
            return { msg: messages.postNotFound.persian }
        
        const posts = result.map((bookmark) => (bookmark.post))
        posts.map(async (post) => { post.photos = (await MinioRepo.getPostPhotoUrl(post.id)) || []})
        return {result: posts, total: posts.length}
    }
    
    async bookmarkPost(userId: UserId, id: JustId) {

        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark();
        if (bookmark)
            return { msg: messages.alreadyBookmarked.persian }
        
        const user = (await this.userRepo.findById(userId))?.toUser()
        const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
        if(!user || !post)
            return { msg: messages.postNotFound.persian }

        const input = toCreateBookmark(user, post)
        const createdBookmark = (await this.bookmarkRepo.create(input)).toBookmark()
        const updatedPost = createdBookmark.post;
        if(createdBookmark !== undefined) return { msg: messages.bookmarked.persian }
        return new ServerError(PersianErrors.ServerError)
    }

    async unbookmarkPost(userId: UserId, id: JustId) {

        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark();
        if (!bookmark) 
            return { msg: messages.notBookmarkedYet.persian }

        const createdBookmark = (await this.bookmarkRepo.remove(bookmark.id)).toBookmark()
        if(!createdBookmark)
            return new ServerError(PersianErrors.ServerError)
        const updatedPost = createdBookmark.post; 
        return  { msg: messages.unbookmarked.persian }
    }
}
