import { DataSource, Repository } from 'typeorm'
import { Content } from './model/content'
import { CommentEntity } from './entity/comment.entity'
import { UserId } from '../user/model/user-id'
import { PostId } from '../post/model/post-id'
import { ParentId } from './model/parent-id'
import { WholeNumber } from '../../data/whole-number'
import { commentDao, commentListDao } from './bll/comment.dao'
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
    findAllByPost(postId: PostId): Promise<ReturnType<typeof commentListDao>>
    //findByID(postId: PostId): Promise<CommentEntity | null>;
}

@Repo()
export class CommentRepository implements ICommentRepository {
    private CommentRepo: Repository<CommentEntity>

    constructor(appDataSource: DataSource) {
        this.CommentRepo = appDataSource.getRepository(CommentEntity)
    }
    async findAllByPost(postId: PostId): Promise<ReturnType<typeof commentListDao>> {
        const comments = await this.CommentRepo.createQueryBuilder('comment')
            .where('comment.postId = :postId', { postId })
            .orderBy('comment.createdAt', 'DESC')
            .leftJoinAndSelect('comment.author', 'author')
            .select(['comment.id', 'comment.content', 'comment.postId', 'comment.likesCount', 'author.id', 'author.username', 'author.name', 'author.lastname'])
            .getMany()
        return commentListDao(comments)
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
