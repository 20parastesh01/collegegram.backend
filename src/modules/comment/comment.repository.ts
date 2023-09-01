import { DataSource, Repository } from 'typeorm'
import { Repo } from '../../registry'
import { Content } from './model/content'
import { CommentId } from './model/comment-id'
import { CommentEntity } from './entity/comment.entity'
import { UserId } from '../user/model/user-id'
import { PostId } from '../post/model/post-id'
import { ParentId } from './model/parent-id'

export interface CreateComment {
    content: Content
    author: UserId
    postId: PostId
    parentId: ParentId | null
}


export interface ICommentRepository {
    create(data: CreateComment): Promise<CommentEntity>
    findAllByPost(postId: PostId): Promise<CommentEntity[] | null>
    //findByID(postId: PostId): Promise<CommentEntity | null>;
}

@Repo()
export class CommentRepository implements ICommentRepository {
    private CommentRepo: Repository<CommentEntity>

    constructor(appDataSource: DataSource) {
        this.CommentRepo = appDataSource.getRepository(CommentEntity)
    }
    async findAllByPost(postId: PostId): Promise<CommentEntity[] | null> {
        const comments = await this.CommentRepo.find({
            where: {
                postId: postId,
            },
            order: {
                createdAt: 'DESC', // Sort by createdAt in descending order
            },
        });
        return comments;
    }
    // async findByauthor(userID: UserId): Promise<PostEntity[] | null> {
    //     return this.PostRepo.findBy({ author:userID })
    // }
    // async findByID(postId: PostId): Promise<CommentEntity | null> {
    //     return this.CommentRepo.findOneBy({ id: CommentId });
    // }
    async create(data: CreateComment): Promise<CommentEntity> {
        return this.CommentRepo.save(data)
    }
}
