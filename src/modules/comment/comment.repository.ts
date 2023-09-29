import { DataSource, Repository } from 'typeorm'
import { Content } from './model/content'
import { CommentEntity } from './entity/comment.entity'
import { UserId } from '../user/model/user-id'
import { PostId } from '../post/model/post-id'
import { commentDao, commentListDao, commentOrNullDao } from './bll/comment.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { CommentId } from './model/comment-id'
import { Comment } from './model/comment'
import { PostWithDetail } from '../post/model/post'

export interface CreateComment {
    content: Content
    author: User
    post: PostWithDetail
    parentId?: CommentId
}

export interface ICommentRepository {
    create(data: CreateComment): Promise<ReturnType<typeof commentDao>>
    remove(commentId: CommentId): Promise<Comment | undefined>
    findAllByPost(postId: PostId): Promise<ReturnType<typeof commentListDao>>
    findByID(commentId: CommentId): Promise<ReturnType<typeof commentOrNullDao>>
    getUserCommentsOnTargetUserPosts(userId: UserId, targetId: UserId): Promise<Comment[]>
}

@Repo()
export class CommentRepository implements ICommentRepository {
    private CommentRepo: Repository<CommentEntity>

    constructor(appDataSource: DataSource) {
        this.CommentRepo = appDataSource.getRepository(CommentEntity)
    }
    async findAllByPost(postId: PostId) {
        const comments: CommentEntity[] = await this.CommentRepo.createQueryBuilder('comment')
            .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
            .where('comment.postId = :postId', { postId })
            .leftJoinAndSelect('comment.author', 'user')
            .leftJoinAndSelect('comment.postId', 'postId')
            .leftJoinAndSelect('comment.parentId', 'commentId')
            .orderBy('comment.createdAt', 'DESC')
            .getMany()
        return commentListDao(comments)
    }
    // async findByauthor(userID: UserId): Promise<PostEntity[] | null> {
    //     return this.PostRepo.findBy({ author:userID })
    // }
    async findByID(commentId: CommentId) {
        const commentEntity = await this.CommentRepo.createQueryBuilder('comment')
            .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
            .where('comment.id = :commentId', { commentId })
            .leftJoinAndSelect('comment.author', 'user')
            .leftJoinAndSelect('comment.postId', 'postId')
            .leftJoinAndSelect('comment.parentId', 'commentId')
            .orderBy('comment.createdAt', 'DESC')
            .getOne()
        return commentOrNullDao(commentEntity)
    }
    async create(data: CreateComment) {
        const commentEntity = await this.CommentRepo.save(data)
        return commentDao(commentEntity)
    }
    async getUserCommentsOnTargetUserPosts(userId: UserId, targetId: UserId) {
        const comments: CommentEntity[] = await this.CommentRepo.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.author', 'user')
        .leftJoinAndSelect('comment.postId', 'postId')
        .leftJoinAndSelect('comment.parentId', 'commentId')
        .where('comment.author.id = :userId', { userId })
        .andWhere('comment.comment.author.id = :targetId', { targetId })
        .getMany()
        return commentListDao(comments).toCommentList()
    }
    async remove(commentId: CommentId) {
        const comment = await this.CommentRepo.findOneBy({ id: commentId })
        if (comment === null) {
            return undefined
        }
        const result = await this.CommentRepo.remove(comment)
        return commentDao(result).toComment()
    }
}
