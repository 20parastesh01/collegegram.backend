import { DataSource, Repository } from 'typeorm'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'
import { UserId } from '../user/model/user-id'
import { WholeNumber } from '../../data/whole-number'
import { postArrayDao, postDaoList, postWithDetailOrNullDao, postWithoutDetailDao, postWithoutDetailOrNullDao } from './bll/post.dao'
import { Repo } from '../../registry/layer-decorators'
import { PostWithoutDetail } from './model/post'

export interface CreatePost {
    caption: Caption
    tags?: Tag[]
    author: UserId
    closeFriend: boolean
}
export type LikeCount = WholeNumber

export interface IPostRepository {
    findWithDetailByID(postId: PostId): Promise<ReturnType<typeof postWithDetailOrNullDao>>
    create(data: CreatePost): Promise<ReturnType<typeof postWithoutDetailDao>>
    findSomeByAuthor(userId: UserId, count: number): Promise<ReturnType<typeof postDaoList>>
    edit(data: PostWithoutDetail): Promise<ReturnType<typeof postWithoutDetailDao>>
    findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postArrayDao>>
    findWithoutDetailByID(postId: PostId): Promise<ReturnType<typeof postWithoutDetailOrNullDao>>
    findAllByAuthorList(usersId: UserId[]): Promise<ReturnType<typeof postArrayDao>>
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }

    async findSomeByAuthor(userId: UserId, count: number): Promise<ReturnType<typeof postDaoList>> {
        const posts: PostEntity[] = await this.PostRepo.find({
            where: {
                author: userId,
            },
            order: {
                createdAt: 'DESC',
            },
            take: count,
        })
        return postDaoList(posts)
    }
    async findAllByAuthor(userId: UserId) {
        const posts: PostEntity[] = await this.PostRepo.createQueryBuilder('post')
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .loadRelationCountAndMap('post.bookmarkCount', 'post.bookmarks')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .where('post.author = :userId', { userId })
            .groupBy('post.id')
            .orderBy('createdAt', 'DESC')
            .getMany()
        return postArrayDao(posts)
    }
    async findAllByAuthorList(usersId: UserId[]) {
        const posts: PostEntity[] = await this.PostRepo.createQueryBuilder('post')
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .loadRelationCountAndMap('post.bookmarkCount', 'post.bookmarks')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .where('post.author IN (:...usersId)', { usersId })
            .orderBy('createdAt', 'DESC')
            .getMany()
        return postArrayDao(posts)
    }
    async findWithoutDetailByID(postId: PostId) {
        const postEntity: PostEntity | null = await this.PostRepo.createQueryBuilder('post').where('post.id = :postId', { postId }).groupBy('post.id').setLock('pessimistic_read').getOne()
        return postWithoutDetailOrNullDao(postEntity)
    }

    async create(data: CreatePost) {
        const postEntity: PostEntity = await this.PostRepo.save(data)
        return postWithoutDetailDao(postEntity)
    }

    async edit(data: PostWithoutDetail) {
        const postEntity: PostEntity = await this.PostRepo.save(data)
        return postWithoutDetailDao(postEntity)
    }

    async findWithDetailByID(postId: PostId) {
        const output: PostEntity | null = await this.PostRepo.createQueryBuilder('post')
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .loadRelationCountAndMap('post.bookmarkCount', 'post.bookmarks')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .where('post.id = :postId', { postId })
            .groupBy('post.id')
            .getOne()

        return postWithDetailOrNullDao(output)
    }
}
