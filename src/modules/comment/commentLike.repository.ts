import { DataSource, Repository } from 'typeorm'
import { CommentLikeEntity } from './entity/commentLike.entity'
import { UserId } from '../user/model/user-id'
import { Repo } from '../../registry/layer-decorators'
import { CommentId } from './model/comment-id'
import { LikeId } from '../postAction/model/like-id'
import { commentLikeDao, commentLikeArrayDao, commentLikeOrNullDao } from './bll/commentLike.dao'
import { Comment } from './model/comment'
import { User } from '../user/model/user'
import { BasicCommentLike } from './model/commentLike'

export interface CreateCommentLike {
    user: User
    comment: Comment
}

export interface ICommentLikeRepository {
    create(data: CreateCommentLike): Promise<ReturnType<typeof commentLikeDao>>
    findAllByUser(userId: UserId): Promise<ReturnType<typeof commentLikeArrayDao>>
    remove(commentLikeId: LikeId): Promise<ReturnType<typeof commentLikeOrNullDao>>
    findAllByComment(commentId: CommentId): Promise<ReturnType<typeof commentLikeArrayDao>>
    findByUserAndComment(userId: UserId, commentId: CommentId): Promise<ReturnType<typeof commentLikeOrNullDao>>
    getUserLikesOnTargetUserComments(userId: UserId, targetId: UserId): Promise<BasicCommentLike[]>
}

@Repo()
export class CommentLikeRepository implements ICommentLikeRepository {
    private CommentLikeRepo: Repository<CommentLikeEntity>

    constructor(appDataSource: DataSource) {
        this.CommentLikeRepo = appDataSource.getRepository(CommentLikeEntity)
    }
    async getUserLikesOnTargetUserComments(userId: UserId, targetId: UserId) {
        const commentLikes: CommentLikeEntity[] = await this.CommentLikeRepo.createQueryBuilder('commentLike')
        .leftJoinAndSelect('commentLike.user', 'user')
        .leftJoinAndSelect('commentLike.comment', 'comment')
        .where('commentLike.user.id = :userId', { userId })
        .andWhere('commentLike.comment.author.id = :targetId', { targetId })
        .getMany()
        return commentLikeArrayDao(commentLikes).toCommentLikeList()
    }
    async findAllByUser(userId: UserId) {
        const commentLike: CommentLikeEntity[] = await this.CommentLikeRepo.createQueryBuilder('commentLike').leftJoinAndSelect('commentLike.user', 'user').leftJoinAndSelect('commentLike.comment', 'comment').where('commentLike.user.id = :userId', { userId }).getMany()
        return commentLikeArrayDao(commentLike)
    }
    async findAllByComment(commentId: CommentId) {
        const commentLike: CommentLikeEntity[] = await this.CommentLikeRepo.createQueryBuilder('commentLike').leftJoinAndSelect('commentLike.user', 'user').leftJoinAndSelect('commentLike.comment', 'comment').where('commentLike.comment.id = :commentId', { commentId }).getMany()
        return commentLikeArrayDao(commentLike)
    }
    async findByUserAndComment(userId: UserId, commentId: CommentId) {
        const output = await this.CommentLikeRepo.createQueryBuilder('commentLike')
            .leftJoinAndSelect('commentLike.user', 'user')
            .leftJoinAndSelect('commentLike.comment', 'comment')
            .where('commentLike.user_id = :userId', { userId })
            .andWhere('commentLike.comment_id = :commentId', { commentId })
            .getOne()
        return commentLikeOrNullDao(output)
    }
    async create(data: CreateCommentLike) {
        const CommentLikeEntity = await this.CommentLikeRepo.save(data)
        return commentLikeDao(CommentLikeEntity)
    }
    async remove(commentLikeId: LikeId) {
        const commentLike = await this.CommentLikeRepo.findOneBy({ id: commentLikeId })
        if (commentLike === null) {
            return commentLikeOrNullDao(null)
        }
        const result = await this.CommentLikeRepo.remove(commentLike)
        return commentLikeOrNullDao(result)
    }
}
