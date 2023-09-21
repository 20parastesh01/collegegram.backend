import { DataSource, Repository } from 'typeorm'
import { LikeEntity } from './entity/like.entity'
import { UserId } from '../user/model/user-id'
import { likeArrayDao, likeDao, likeOrNullDao } from './bll/like.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { LikeId } from './model/like-id'
import { PostWithoutDetail } from '../post/model/post'
import { PostId } from '../post/model/post-id'

export interface CreateLike {
    user: User
    post: PostWithoutDetail
}

export interface ILikeRepository {
    create(data: CreateLike): Promise<ReturnType<typeof likeDao>>
    findAllByUser(userId: UserId): Promise<ReturnType<typeof likeArrayDao>>
    remove(likeId: LikeId): Promise<ReturnType<typeof likeOrNullDao>>
    findAllByPost(postId: PostId): Promise<ReturnType<typeof likeArrayDao>>
    findByUserAndPost(userId: UserId, postId: PostId): Promise<ReturnType<typeof likeOrNullDao>>
}

@Repo()
export class LikeRepository implements ILikeRepository {
    private LikeRepo: Repository<LikeEntity>

    constructor(appDataSource: DataSource) {
        this.LikeRepo = appDataSource.getRepository(LikeEntity)
    }
    async findAllByUser(userId: UserId) {
        const like: LikeEntity[] = await this.LikeRepo.createQueryBuilder('like').leftJoinAndSelect('like.user', 'user').leftJoinAndSelect('like.post', 'post').where('like.user.id = :userId', { userId }).getMany()
        return likeArrayDao(like)
    }
    async findAllByPost(postId: PostId) {
        const like: LikeEntity[] = await this.LikeRepo.createQueryBuilder('like').leftJoinAndSelect('like.user', 'user').leftJoinAndSelect('like.post', 'post').where('like.post.id = :postId', { postId }).getMany()
        return likeArrayDao(like)
    }
    async findByUserAndPost(userId: UserId, postId: PostId) {
        const output = await this.LikeRepo.createQueryBuilder('like').leftJoinAndSelect('like.user', 'user').leftJoinAndSelect('like.post', 'post').where('like.user.id = :userId', { userId }).andWhere('like.post.id = :postId', { postId }).getOne()
        return likeOrNullDao(output)
    }
    async create(data: CreateLike) {
        const likeEntity = await this.LikeRepo.save(data)
        return likeDao(likeEntity)
    }
    async remove(likeId: LikeId) {
        const like = await this.LikeRepo.findOneBy({ id: likeId })
        return like === null ? likeOrNullDao(null) : likeOrNullDao(await this.LikeRepo.remove(like))
    }
}
