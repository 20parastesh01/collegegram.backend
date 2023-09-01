import { DataSource, Repository } from 'typeorm'
import { Content } from './model/content'
import { CommentEntity } from './entity/comment.entity'
import { UserId } from '../user/model/user-id'
import { PostId } from '../post/model/post-id'
import { ParentId } from './model/parent-id'
import { WholeNumber } from '../../data/whole-number'
import { commentDao } from './bll/comment.dao'
import { Repo } from '../../registry/layer-decorators'

export interface CreateComment {
    content: Content
    author: UserId
    postId: PostId
    parentId?: ParentId
    likesCount: WholeNumber
}

export interface ICommentRepository {
    create(data: CreateComment): Promise<ReturnType<typeof commentDao>>
    findAllByPost(postId: PostId): Promise<ReturnType<typeof commentDao>>
    //findByID(postId: PostId): Promise<CommentEntity | null>;
}

@Repo()
export class CommentRepository implements ICommentRepository {
    private CommentRepo: Repository<CommentEntity>

    constructor(appDataSource: DataSource) {
        this.CommentRepo = appDataSource.getRepository(CommentEntity)
    }
    async findAllByPost(postId: PostId): Promise<ReturnType<typeof commentDao>> {
        const comments = await this.CommentRepo.find({
            where: {
                postId: postId,
            },
            order: {
                createdAt: 'DESC', // Sort by createdAt in descending order
            },
        });
        return commentDao(comments);
    }
    // async findByauthor(userID: UserId): Promise<PostEntity[] | null> {
    //     return this.PostRepo.findBy({ author:userID })
    // }
    // async findByID(postId: PostId): Promise<CommentEntity | null> {
    //     return this.CommentRepo.findOneBy({ id: CommentId });
    // }
    async create(data: CreateComment): Promise<ReturnType<typeof commentDao>> {
        const commentEntity = await this.CommentRepo.save(data)
        return commentDao(commentEntity)
    }
}
