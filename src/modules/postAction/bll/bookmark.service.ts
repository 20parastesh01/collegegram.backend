import { ServerError } from '../../../utility/http-error'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { BookmarkRepository, IBookmarkRepository } from '../bookmark.repository'
import { toCreateBookmark } from './bookmark.dao'
import { PostWithDetail } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'
import { IPostService, PostService } from '../../post/bll/post.service'
import { IUserService, UserService } from '../../user/bll/user.service'

type arrayResult = { result: PostWithDetail[], total: number }
type Message = { msg: Msg }

export interface IBookmarkService {
    bookmarkPost(userId: UserId, id: JustId): Promise<Message | ServerError>
    unbookmarkPost(userId: UserId, id: JustId): Promise<Message | ServerError>
    getMyBookmarkeds(userId: UserId): Promise<Message | arrayResult>
}

@Service(BookmarkRepository, PostService, UserService)
export class BookmarkService implements IBookmarkService {
    constructor(
        private bookmarkRepo: IBookmarkRepository,
        private postService: IPostService,
        private userService: IUserService
    ) {}

    async getMyBookmarkeds(userId: UserId) {
        const result = (await this.bookmarkRepo.findAllByUser(userId)).toBookmarkList()
        if (result.length < 1) return { msg: messages.postNotFound.persian }

        const posts = result.map((bookmark) => bookmark.post)
        const postsWithPhotos = await Promise.all(posts.map((post) => (this.postService.adjustPhoto(post))))
        return { result: postsWithPhotos, total: posts.length }
    }

    async bookmarkPost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark()
        if (bookmark) return { msg: messages.alreadyBookmarked.persian }

        const user = await this.userService.getUserById(userId)
        const post = await this.postService.getPost(id, userId)
        if (user === null || 'msg' in post) return { msg: messages.postNotFound.persian }

        const input = toCreateBookmark(user, post)
        const createdBookmark = (await this.bookmarkRepo.create(input)).toBookmark()
        if (createdBookmark !== undefined) return { msg: messages.bookmarked.persian }
        return new ServerError(PersianErrors.ServerError)
    }

    async unbookmarkPost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark()
        if (!bookmark) return { msg: messages.notBookmarkedYet.persian }

        const post = await this.postService.getPost(id, userId)
        if('msg' in post) return { msg: messages.postNotFound.persian }
        
        const createdBookmark = (await this.bookmarkRepo.remove(bookmark.id)).toBookmark()
        if (!createdBookmark) return new ServerError(PersianErrors.ServerError)
        const updatedPost = createdBookmark.post
        return { msg: messages.unbookmarked.persian }
    }
}
