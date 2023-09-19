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
}
export interface CommentWithDetail extends CommentEntity {
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
        const comments : CommentWithDetail[] = await this.CommentRepo.createQueryBuilder('comment')
            .loadRelationCountAndMap('comment.likes', 'comment.likeCount')
            .where('comment.postId = :postId', { postId })
            .leftJoinAndSelect('comment.author', 'user')
            .leftJoinAndSelect('comment.postId', 'postId')
            .leftJoinAndSelect('comment.parentId', 'commentId')
            .groupBy('comment.id')
            .orderBy('comment.createdAt', 'DESC')
            .getRawMany()
        return commentListDao(comments)
    }
    // async findByauthor(userID: UserId): Promise<PostEntity[] | null> {
    //     return this.PostRepo.findBy({ author:userID })
    // }
    async findByID(commentId: CommentId) {
        const commentEntity = await this.CommentRepo.createQueryBuilder('comment')
        .loadRelationCountAndMap('comment.likes', 'comment.likeCount')
        .where('comment.id = :commentId', { commentId })
        .leftJoinAndSelect('comment.author', 'user')
        .leftJoinAndSelect('comment.postId', 'postId')
        .leftJoinAndSelect('comment.parentId', 'commentId')
        .groupBy('comment.id')
        .orderBy('comment.createdAt', 'DESC')
        .getRawOne()
        return commentOrNullDao(commentEntity)
    }
    async create(data: CreateComment) {
        const commentEntity = await this.CommentRepo.save(data)
        return commentDao(commentEntity)
    }
}
