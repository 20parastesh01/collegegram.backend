import { DataSource, Repository } from 'typeorm'
import { BookmarkEntity } from './entity/bookmark.entity'
import { UserId } from '../user/model/user-id'
import { bookmarkArrayDao, bookmarkDao, bookmarkOrNullDao } from './bll/bookmark.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { BookmarkId } from './model/bookmark-id'
import { PostWithDetail } from '../post/model/post'
import { PostId } from '../post/model/post-id'
import { BookmarkWithPost } from './model/bookmark'

export interface CreateBookmark {
    user: User
    post: PostWithDetail
}

export interface IBookmarkRepository {
    create(data: CreateBookmark): Promise<BookmarkWithPost>
    findAllByUser(userId: UserId): Promise<BookmarkWithPost[]>
    findAllByPost(postId: PostId): Promise<BookmarkWithPost[]>
    remove(bookmarkId: BookmarkId): Promise<BookmarkWithPost | undefined>
    findByUserAndPost(userId: UserId, postId: PostId): Promise<BookmarkWithPost | undefined>
}

@Repo()
export class BookmarkRepository implements IBookmarkRepository {
    private BookmarkRepo: Repository<BookmarkEntity>

    constructor(appDataSource: DataSource) {
        this.BookmarkRepo = appDataSource.getRepository(BookmarkEntity)
    }
    async findAllByUser(userId: UserId) {
        const bookmark: BookmarkEntity[] = await this.BookmarkRepo.createQueryBuilder('bookmark').leftJoinAndSelect('bookmark.user', 'user').leftJoinAndSelect('bookmark.post', 'post').where('bookmark.user.id = :userId', { userId }).orderBy('bookmark.createdAt', 'DESC').getMany()
        return bookmarkArrayDao(bookmark).toBookmarkList()
    }
    async findAllByPost(postId: PostId) {
        const bookmark: BookmarkEntity[] = await this.BookmarkRepo.createQueryBuilder('bookmark').leftJoinAndSelect('bookmark.user', 'user').leftJoinAndSelect('bookmark.post', 'post').where('bookmark.post.id = :postId', { postId }).orderBy('bookmark.createdAt', 'DESC').getMany()
        return bookmarkArrayDao(bookmark).toBookmarkList()
    }
    async findByUserAndPost(userId: UserId, postId: PostId) {
        const output = await this.BookmarkRepo.createQueryBuilder('bookmark').leftJoinAndSelect('bookmark.user', 'user').leftJoinAndSelect('bookmark.post', 'post').where('bookmark.user.id = :userId', { userId }).andWhere('bookmark.post.id = :postId', { postId }).getOne()
        return bookmarkOrNullDao(output).toBookmark()
    }
    async create(data: CreateBookmark) {
        const bookmarkEntity = await this.BookmarkRepo.save(data)
        return bookmarkDao(bookmarkEntity).toBookmark()
    }
    async remove(bookmarkId: BookmarkId) {
        const bookmark = await this.BookmarkRepo.findOneBy({ id: bookmarkId })
        if (bookmark === null) return undefined
        const result = await this.BookmarkRepo.remove(bookmark)
        return bookmarkDao(result).toBookmark()
    }
}
