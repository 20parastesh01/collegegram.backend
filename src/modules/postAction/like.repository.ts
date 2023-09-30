import { DataSource, Repository } from 'typeorm'
import { LikeEntity } from './entity/like.entity'
import { UserId } from '../user/model/user-id'
import { likeArrayDao, likeDao, likeOrNullDao } from './bll/like.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { LikeId } from './model/like-id'
import { PostWithDetail } from '../post/model/post'
import { PostId } from '../post/model/post-id'
import { LikeWithPost } from './model/like'

export interface CreateLike {
    user: User
    post: PostWithDetail
}

export interface ILikeRepository {
    create(data: CreateLike): Promise<LikeWithPost>
    findAllByUser(userId: UserId): Promise<LikeWithPost[]>
    remove(likeId: LikeId): Promise<LikeWithPost | undefined>
    findAllByPost(postId: PostId): Promise<LikeWithPost[]>
    findByUserAndPost(userId: UserId, postId: PostId): Promise<LikeWithPost | undefined>
    getUserLikesOnTargetUserPosts(userId: UserId, targetId: UserId): Promise<LikeWithPost[]>
}

@Repo()
export class LikeRepository implements ILikeRepository {
    private LikeRepo: Repository<LikeEntity>

    constructor(appDataSource: DataSource) {
        this.LikeRepo = appDataSource.getRepository(LikeEntity)
    }
    async getUserLikesOnTargetUserPosts(userId: UserId, targetId: UserId) {
        const likes: LikeEntity[] = await this.LikeRepo.createQueryBuilder('like')
        .leftJoinAndSelect('like.user', 'user')
        .leftJoinAndSelect('like.post', 'post')
        .where('like.user.id = :userId', { userId })
        .andWhere('like.post.author = :targetId', { targetId })
        .getMany()
        return likeArrayDao(likes).toLikeList()
    }
    async findAllByUser(userId: UserId) {
        const likes: LikeEntity[] = await this.LikeRepo.createQueryBuilder('like').leftJoinAndSelect('like.user', 'user').leftJoinAndSelect('like.post', 'post').where('like.user.id = :userId', { userId }).orderBy('like.createdAt', 'DESC').getMany()
        return likeArrayDao(likes).toLikeList()
    }
    async findAllByPost(postId: PostId) {
        const likes: LikeEntity[] = await this.LikeRepo.createQueryBuilder('like').leftJoinAndSelect('like.user', 'user').leftJoinAndSelect('like.post', 'post').where('like.post.id = :postId', { postId }).orderBy('like.createdAt', 'DESC').getMany()
        return likeArrayDao(likes).toLikeList()
    }
    async findByUserAndPost(userId: UserId, postId: PostId) {
        const output = await this.LikeRepo.createQueryBuilder('like').leftJoinAndSelect('like.user', 'user').leftJoinAndSelect('like.post', 'post').where('like.user.id = :userId', { userId }).andWhere('like.post.id = :postId', { postId }).getOne()
        return likeOrNullDao(output).toLike()
    }
    async create(data: CreateLike) {
        const likeEntity = await this.LikeRepo.save(data)
        return likeDao(likeEntity).toLike()
    }
    async remove(likeId: LikeId) {
        const like = await this.LikeRepo.findOneBy({ id: likeId })
        if (like === null) return undefined
        const result = await this.LikeRepo.remove(like)
        return likeDao(result).toLike()
    }
}
