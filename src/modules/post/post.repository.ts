import { DataSource, Repository } from 'typeorm'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'
import { UserId } from '../user/model/user-id'
import { WholeNumber } from '../../data/whole-number'
import { postArrayDao, postWithLikeOrNullDao, postWithoutLikeDao, postWithoutLikeOrNullDao } from './bll/post.dao'
import { Repo } from '../../registry/layer-decorators'
import { LikeEntity } from './entity/like.entity'

export interface CreatePost {
    caption: Caption
    tags?: Tag[]
    author: UserId
    photosCount: WholeNumber
    closeFriend: boolean
    likeCount: WholeNumber
    commentsCount: WholeNumber
}
export type LikeCount = WholeNumber
export interface PostWithLikeCountEntity extends PostEntity {
    likeCount: WholeNumber;
}

export interface IPostRepository {
    findPostWithLikeCountByID(postId: PostId): Promise<ReturnType<typeof postWithLikeOrNullDao>>
    create(data: CreatePost): Promise<ReturnType<typeof postWithoutLikeDao>>
    findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postArrayDao>>
    findPostWithoutLikeCountByID(postId: PostId): Promise<ReturnType<typeof postWithoutLikeOrNullDao>>
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
    async findPostWithoutLikeCountByID(postId: PostId) {
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
    async findPostWithLikeCountByID(postId: PostId) {
        const output : PostWithLikeCountEntity | undefined = await this.PostRepo.createQueryBuilder('post')
        .loadRelationCountAndMap('post.likes', 'post.likeCount')
        .where('post.id = :postId', { postId })
        .groupBy('post.id')
        .getRawOne();
        // const output : PostWithLikeCountEntity | undefined = await this.PostRepo.createQueryBuilder('post')
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
