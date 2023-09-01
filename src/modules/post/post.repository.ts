import { DataSource, Repository } from 'typeorm'
import { Repo } from '../../registry'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'
import { UserId } from '../user/model/user-id'

export interface CreatePost {
    caption: Caption
    tags: Tag[]
    author: UserId
    photos: string[]
    closeFriend: boolean
}


export interface IPostRepository {
    create(data: CreatePost): Promise<PostEntity>
    findAllByAuthor(userId: UserId): Promise<PostEntity[] | null>
    findByID(postId: PostId): Promise<PostEntity | null>;
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }
    async findAllByAuthor(userId: UserId): Promise<PostEntity[] | null> {
        const posts = await this.PostRepo.find({
            where: {
                author: userId,
            },
            order: {
                createdAt: 'DESC', // Sort by createdAt in descending order
            },
        });
        return posts;
    }
    // async findByauthor(userID: UserId): Promise<PostEntity[] | null> {
    //     return this.PostRepo.findBy({ author:userID })
    // }
    async findByID(postId: PostId): Promise<PostEntity | null> {
        return this.PostRepo.findOneBy({ id: postId });
    }
    async create(data: CreatePost): Promise<PostEntity> {
        return this.PostRepo.save(data)
    }
}
