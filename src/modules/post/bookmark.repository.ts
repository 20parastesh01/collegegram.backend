import { DataSource, Repository } from 'typeorm'
import { BookmarkEntity } from './entity/bookmark.entity'
import { UserId } from '../user/model/user-id'
import { bookmarkArrayDao, bookmarkDao, bookmarkOrNullDao } from './bll/bookmark.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { PostWithoutDetail } from './model/post'
import { PostId } from './model/post-id'
import { BookmarkId } from './model/bookmark-id'

export interface CreateBookmark {
    user: User
    post: PostWithoutDetail
}

export interface IBookmarkRepository {
    create(data: CreateBookmark): Promise<ReturnType<typeof bookmarkDao>>
    findByUser(userId: UserId): Promise<ReturnType<typeof bookmarkArrayDao>>
    findByPost(postId: PostId): Promise<ReturnType<typeof bookmarkArrayDao>>
    remove(bookmarkId : BookmarkId): Promise<ReturnType<typeof bookmarkOrNullDao>>
    findByUserAndPost(userId: UserId, postId: PostId): Promise<ReturnType<typeof bookmarkOrNullDao>>
}

@Repo()
export class BookmarkRepository implements IBookmarkRepository {
    private BookmarkRepo: Repository<BookmarkEntity>

    constructor(appDataSource: DataSource) {
        this.BookmarkRepo = appDataSource.getRepository(BookmarkEntity)
    }
    async findByUser(userId: UserId) {
        const bookmark: BookmarkEntity[] = await this.BookmarkRepo.createQueryBuilder("bookmark")
        .leftJoinAndSelect("bookmark.user", "user")
        .leftJoinAndSelect("bookmark.post", "post")
        .where('bookmark.user.id = :userId', { userId })
        .getMany()
        return bookmarkArrayDao(bookmark)
    }
    async findByPost(postId: PostId) {
        const bookmark: BookmarkEntity[] = await this.BookmarkRepo.createQueryBuilder("bookmark")
        .leftJoinAndSelect("bookmark.user", "user")
        .leftJoinAndSelect("bookmark.post", "post")
        .where('bookmark.post.id = :postId', { postId })
        .getMany()
        return bookmarkArrayDao(bookmark)
    }
    async findByUserAndPost(userId: UserId, postId: PostId) {
        const output = await this.BookmarkRepo.createQueryBuilder("bookmark")
        .leftJoinAndSelect("bookmark.user", "user")
        .leftJoinAndSelect("bookmark.post", "post")
        .where('bookmark.user.id = :userId', { userId })
        .andWhere('bookmark.post.id = :postId', { postId })
        .getOne()
        return bookmarkOrNullDao(output)
    }
    async create(data: CreateBookmark) {
        const bookmarkEntity = await this.BookmarkRepo.save(data)
        return bookmarkDao(bookmarkEntity)
    }
    async remove(bookmarkId : BookmarkId) {
        const bookmark = await this.BookmarkRepo.findOneBy({ id: bookmarkId });
        return bookmark === null ?  bookmarkOrNullDao(null) : bookmarkOrNullDao(await this.BookmarkRepo.remove(bookmark));
    }
}
