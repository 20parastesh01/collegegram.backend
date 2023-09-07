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
    photosCount: WholeNumber
    closeFriend: boolean
    likesCount: WholeNumber
    commentsCount: WholeNumber
}
export interface PostWithLikesCountEntity extends PostEntity {
    likesCount: WholeNumber;
}

export interface IPostRepository {
    findPostWithLikesCountByID(postId: PostId): Promise<ReturnType<typeof postWithLikeOrNullDao>>
    create(data: CreatePost): Promise<ReturnType<typeof postWithoutLikeDao>>
    findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postArrayDao>>
    findPostWithoutLikesCountByID(postId: PostId): Promise<ReturnType<typeof postWithoutLikeOrNullDao>>
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }
    async findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postArrayDao>> {
        const posts: PostEntity[] = await this.PostRepo.find({
            where: {
                author: userId,
            },
            order: {
                createdAt: 'DESC', // Sort by createdAt in descending order
            },
        })
        return postArrayDao(posts)
    }
    async findPostWithoutLikesCountByID(postId: PostId): Promise<ReturnType<typeof postWithoutLikeOrNullDao>> {
        const postEntity : PostEntity | null = await this.PostRepo.findOneBy({ id: postId })
        return postWithoutLikeOrNullDao(postEntity)
    }
    async create(data: CreatePost): Promise<ReturnType<typeof postWithoutLikeDao>> {
        const postEntity : PostEntity = await this.PostRepo.save(data)
        return postWithoutLikeDao(postEntity)
    }
    async findPostWithLikesCountByID(postId: PostId): Promise<ReturnType<typeof postWithLikeOrNullDao>> {
        const post : PostWithLikesCountEntity | undefined = await this.PostRepo.createQueryBuilder('post')
        .leftJoinAndSelect('post.likes', 'like') 
        .addSelect('COUNT(like.id)', 'likesCount')
        .where('post.id = :postId', { postId })
        .groupBy('post.id')
        .getRawOne();
      
        return postWithLikeOrNullDao(post);
    }
}
