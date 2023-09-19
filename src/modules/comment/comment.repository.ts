import { DataSource, Repository } from 'typeorm'
import { Content } from './model/content'
import { CommentEntity } from './entity/comment.entity'
import { UserId } from '../user/model/user-id'
import { PostId } from '../post/model/post-id'
import { ParentId } from './model/parent-id'
import { WholeNumber } from '../../data/whole-number'
import { commentDao, commentListDao, commentOrNullDao } from './bll/comment.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { CommentId } from './model/comment-id'

export interface CreateComment {
    content: Content
    author: User
    postId: PostId
    parentId?: ParentId
    likeCount: WholeNumber
}

export interface ICommentRepository {
    create(data: CreateComment): Promise<ReturnType<typeof commentDao>>
    findAllByPost(postId: PostId): Promise<ReturnType<typeof commentListDao>>
    findByID(commentId: CommentId): Promise<ReturnType<typeof commentOrNullDao>>
}

@Repo()
export class CommentRepository implements ICommentRepository {
    private CommentRepo: Repository<CommentEntity>

    constructor(appDataSource: DataSource) {
        this.CommentRepo = appDataSource.getRepository(CommentEntity)
    }
    async findAllByPost(postId: PostId) {
        const comments = await this.CommentRepo.createQueryBuilder('comment')
            .where('comment.postId = :postId', { postId })
            .orderBy('comment.createdAt', 'DESC')
            .leftJoinAndSelect('comment.author', 'author')
            .groupBy('comment.id')
            .getMany()
        return commentListDao(comments)
    }
    // async findByauthor(userID: UserId): Promise<PostEntity[] | null> {
    //     return this.PostRepo.findBy({ author:userID })
    // }
    async findByID(commentId: CommentId) {
        const commentEntity = await this.CommentRepo.findOneBy({ id: commentId });
        return commentOrNullDao(commentEntity)
    }
    async create(data: CreateComment) {
        const commentEntity = await this.CommentRepo.save(data)
        return commentDao(commentEntity)
    }
}
