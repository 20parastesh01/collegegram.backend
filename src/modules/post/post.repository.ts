import { DataSource, Repository } from 'typeorm'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'
import { UserId } from '../user/model/user-id'
import { WholeNumber } from '../../data/whole-number'
import { postDao } from './bll/post.dao'
import { Repo } from '../../registry/layer-decorators'

export interface CreatePost {
    caption: Caption
    tags: Tag[]
    author: UserId
    photosCount: WholeNumber
    closeFriend: boolean
    likesCount: WholeNumber
    commentsCount: WholeNumber
}


export interface IPostRepository {
    create(data: CreatePost): Promise<ReturnType<typeof postDao>>
    findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postDao>>
    findByID(postId: PostId): Promise<ReturnType<typeof postDao>>;
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }
    async findAllByAuthor(userId: UserId): Promise<ReturnType<typeof postDao>> {
        const posts : PostEntity[] = await this.PostRepo.find({
            where: {
                author: userId,
            },
            order: {
                createdAt: 'DESC', // Sort by createdAt in descending order
            },
        });
        return postDao(posts)
    }
    async findByID(postId: PostId): Promise<ReturnType<typeof postDao>> {
        const postEntity =  await this.PostRepo.findOneBy({ id: postId });
        return postDao(postEntity)
    }
    async create(data: CreatePost): Promise<ReturnType<typeof postDao>> {
        const postEntity = await this.PostRepo.save(data)
        return postDao(postEntity)
    }
}
