import { DataSource, Repository } from 'typeorm'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'
import { UserId } from '../user/model/user-id'
import { WholeNumber } from '../../data/whole-number'
import { postArrayDao, postWithLikeOrNullDao, postWithoutLikeDao, postWithoutLikeOrNullDao } from './bll/post.dao'
import { Repo } from '../../registry/layer-decorators'

export interface CreatePost {
    caption: Caption
    tags?: Tag[]
    author: UserId
    closeFriend: boolean
    likeCount: WholeNumber
    commentCount: WholeNumber
}
export type LikeCount = WholeNumber
export interface PostWithDetailEntity extends PostEntity {
    likeCount: WholeNumber;
    bookmarkCount: WholeNumber;
}

export interface IPostRepository {
    findWithDetailByID(postId: PostId): Promise<ReturnType<typeof postWithLikeOrNullDao>>
    create(data: CreatePost): Promise<ReturnType<typeof postWithoutLikeDao>>
    findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postArrayDao>>
    findWithoutDetailByID(postId: PostId): Promise<ReturnType<typeof postWithoutLikeOrNullDao>>
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }
    async findAllByAuthor(userId: UserId) {
        const posts: PostEntity[] = await this.PostRepo.createQueryBuilder('post')
        .leftJoin("post.author", "author")
        .loadRelationCountAndMap('post.likes', 'post.likeCount')
        .where('post.author = :userId', { userId })
        .groupBy('post.id')
        .getRawMany();
        // const posts: PostEntity[] = await this.PostRepo.createQueryBuilder('post')
        // .leftJoin("post.author", "author")
        // .leftJoinAndMapOne("post.Likes",'likes','like','like.post_id = post.id')
        // .addSelect('COUNT(like.id)', 'likeCount')
        // .where('post.author = :userId', { userId })
        // .groupBy('post.id')
        // .setLock("pessimistic_read")
        // .getRawMany();
        return postArrayDao(posts)
    }
    async findWithoutDetailByID(postId: PostId) {
        const postEntity : PostEntity | null = await this.PostRepo.createQueryBuilder('post')
        .leftJoin("post.author", "author")
        .where('post.id = :postId', { postId })
        .groupBy('post.id')
        .setLock("pessimistic_read")
        .getOne();
        return postWithoutLikeOrNullDao(postEntity)
    }
    async create(data: CreatePost) {
        const postEntity : PostEntity = await this.PostRepo.save(data)
        return postWithoutLikeDao(postEntity)
    }
    async findWithDetailByID(postId: PostId) {
        const output : PostWithDetailEntity | undefined = await this.PostRepo.createQueryBuilder('post')
        .loadRelationCountAndMap('post.likes', 'post.likeCount')
        .loadRelationCountAndMap('post.bookmarks', 'post.bookmarkCount')
        .loadRelationCountAndMap('post.comments', 'post.commentCount')
        .where('post.id = :postId', { postId })
        .groupBy('post.id')
        .getRawOne();
        // const output : PostWithDetailEntity | undefined = await this.PostRepo.createQueryBuilder('post')
        // .leftJoin("post.author", "author")
        // .leftJoinAndMapOne("post.Likes",'likes','like','like.post_id = post.id')
        // .addSelect('COUNT(like.id)', 'likeCount')
        // .where('post.id = :postId', { postId })
        // .groupBy('post.id')
        // .setLock("pessimistic_read")
        // .getRawOne();
      
        return postWithLikeOrNullDao(output);
    }
}
