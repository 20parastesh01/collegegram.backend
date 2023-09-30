import { DataSource, In, Repository } from 'typeorm'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'
import { UserId } from '../user/model/user-id'
import { WholeNumber } from '../../data/whole-number'
import { postArrayDao, postDaoList, postWithDetailOrNullDao, postWithoutDetailDao, postWithoutDetailOrNullDao } from './bll/post.dao'
import { Repo } from '../../registry/layer-decorators'
import { BasicPost, PostWithDetail, PostWithoutDetail } from './model/post'
import { PaginationInfo } from '../../data/pagination'

export interface CreatePost {
    caption: Caption
    tags?: Tag[]
    author: UserId
    closeFriend: boolean
}
export type LikeCount = WholeNumber

export interface IPostRepository {
    findWithDetailByID(postId: PostId): Promise<PostWithDetail | undefined>
    create(data: CreatePost): Promise<PostWithDetail>
    findSomeByAuthor(userId: UserId, count: number, closeFriend: boolean[]): Promise<BasicPost[]>
    edit(data: PostWithoutDetail): Promise<PostWithDetail>
    findAllFullPosts(userId: UserId, closeFriend: boolean[]): Promise<PostWithDetail[]>;
    findAllBasicPosts(userId: UserId, closeFriend: boolean[]): Promise<BasicPost[]>;
    findWithoutDetailByID(postId: PostId): Promise<undefined | PostWithoutDetail>
    findAllByAuthorList(usersId: UserId[], closeFriend: boolean[]): Promise<PostWithDetail[]>
    countByAuthor(userId: UserId, closeFriend: boolean[]): Promise<number>
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }

    async findSomeByAuthor(userId: UserId, count: number, closeFriend: boolean[]) {
        const posts: PostEntity[] = await this.PostRepo.find({
            where: {
                author: userId,
                closeFriend: In(closeFriend)
            },
            order: {
                createdAt: 'DESC',
            },
            take: count,
        })
        return postDaoList(posts).toThumbnailList()
    }

    async countByAuthor(userId: UserId) {
        return this.PostRepo.countBy({ author: userId })
    }

    
    private async findPostsByUser(userId: UserId, closeFriend: boolean[]): Promise<PostEntity[]> {
        return await this.PostRepo.createQueryBuilder('post')
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .loadRelationCountAndMap('post.bookmarkCount', 'post.bookmarks')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .where('post.author = :userId', { userId })
            .andWhere('post.closeFriend IN (:...closeFriend)', { closeFriend })
            .orderBy('post.createdAt', 'DESC')
            .getMany();
    }

    async findAllFullPosts(userId: UserId, closeFriend: boolean[]): Promise<PostWithDetail[]> {
        const posts: PostEntity[] = await this.findPostsByUser(userId, closeFriend);
        return postArrayDao(posts).toPostList();
    }

    async findAllBasicPosts(userId: UserId, closeFriend: boolean[]): Promise<BasicPost[]> {
        const posts: PostEntity[] = await this.findPostsByUser(userId, closeFriend);
        return postArrayDao(posts).toThumbnailList();
    }

    async findAllByAuthorList(usersId: UserId[], closeFriend: boolean[]) {
        const posts: PostEntity[] = await this.PostRepo.createQueryBuilder('post')
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .loadRelationCountAndMap('post.bookmarkCount', 'post.bookmarks')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .where('post.author IN (:...usersId)', { usersId })
            .orderBy('post.createdAt', 'DESC')
            .getMany()
        return postArrayDao(posts).toPostList()
    }
    async findWithoutDetailByID(postId: PostId) {
        const postEntity: PostEntity | null = await this.PostRepo.createQueryBuilder('post').where('post.id = :postId', { postId }).getOne()
        return postWithoutDetailOrNullDao(postEntity).toPost()
    }

    async create(data: CreatePost) {
        const postEntity: PostEntity = await this.PostRepo.save(data)
        return postWithoutDetailDao(postEntity).toPost()
    }

    async edit(data: PostWithoutDetail) {
        const postEntity: PostEntity = await this.PostRepo.save(data)
        return postWithoutDetailDao(postEntity).toPost()
    }

    async findWithDetailByID(postId: PostId) {
        const output: PostEntity | null = await this.PostRepo.createQueryBuilder('post')
            .loadRelationCountAndMap('post.likeCount', 'post.likes')
            .loadRelationCountAndMap('post.bookmarkCount', 'post.bookmarks')
            .loadRelationCountAndMap('post.commentCount', 'post.comments')
            .where('post.id = :postId', { postId })
            .getOne()

        return postWithDetailOrNullDao(output).toPost()
    }

    async search(userId: UserId, tag: Tag, followingUserIds: UserId[], usersAddedHimAsCloseFriend: UserId[], usersBlockedHim: UserId[], privateUserIds: UserId[], paginationInfo: PaginationInfo) {
        const { page, pageSize } = paginationInfo
        const posts = await this.PostRepo.find()
        const result = []
        for (let post of posts) {
            if (!post.tags?.includes(tag)) continue
            if (usersBlockedHim.includes(post.author)) {
                continue
            }
            if (post.closeFriend && !usersAddedHimAsCloseFriend.includes(post.author)) {
                continue
            }
            if (privateUserIds.includes(post.author) && !followingUserIds.includes(post.author)) {
                continue
            }
            result.push(post)
            if (result.length === 25) return result
        }
        return result
    }

    async search2(tag: Tag, followingUserIds: UserId[], usersAddedHimAsCloseFriend: UserId[], usersBlockedHim: UserId[], privateUserIds: UserId[], paginationInfo: PaginationInfo) {
        const { page, pageSize } = paginationInfo

        const query = this.PostRepo.createQueryBuilder('post').where(':tag = ANY(post.tags)', { tag })

        if (usersBlockedHim.length > 0) {
            query.andWhere('post.author NOT IN (:...blockedUsers)', { blockedUsers: usersBlockedHim })
        }

        query.andWhere('(post.closeFriend = false OR post.author IN (:...closeFriends))', { closeFriends: usersAddedHimAsCloseFriend })

        if (privateUserIds.length > 0) {
            query.andWhere('(post.author NOT IN (:...privateUsers) OR post.author IN (:...followingUsers))', {
                privateUsers: privateUserIds,
                followingUsers: followingUserIds,
            })
        }
        query.skip((page - 1) * pageSize).take(pageSize)

        const result = await query.getMany()
        return result
    }
}
