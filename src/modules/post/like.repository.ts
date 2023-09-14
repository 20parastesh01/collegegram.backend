import { DataSource, Repository } from 'typeorm'
import { LikeEntity } from './entity/like.entity'
import { UserId } from '../user/model/user-id'
import { likeArrayDao, likeDao, likeOrNullDao } from './bll/like.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { PostWithoutLikeCount } from './model/post'
import { PostId } from './model/post-id'
import { LikeId } from './model/like-id'

export interface CreateLike {
    user: User
    post: PostWithoutLikeCount
}

export interface ILikeRepository {
    create(data: CreateLike): Promise<ReturnType<typeof likeDao>>
    findByUser(userId: UserId): Promise<ReturnType<typeof likeArrayDao>>
    removeLike(likeId : LikeId): Promise<ReturnType<typeof likeOrNullDao>>
    findByUserAndPost(userId: UserId, postId: PostId): Promise<ReturnType<typeof likeOrNullDao>>
}

@Repo()
export class LikeRepository implements ILikeRepository {
    private LikeRepo: Repository<LikeEntity>

    constructor(appDataSource: DataSource) {
        this.LikeRepo = appDataSource.getRepository(LikeEntity)
    }
    async findByUser(userId: UserId) {
        const like: LikeEntity[] = await this.LikeRepo.createQueryBuilder("like")
        .leftJoinAndSelect("like.user", "user")
        .leftJoinAndSelect("like.post", "post")
        .where('like.user.id = :userId', { userId })
        .getMany()
        return likeArrayDao(like)
    }
    async findByUserAndPost(userId: UserId, postId: PostId) {
        const output = await this.LikeRepo.createQueryBuilder("like")
        .leftJoinAndSelect("like.user", "user")
        .leftJoinAndSelect("like.post", "post")
        .where('like.user.id = :userId', { userId })
        .andWhere('like.post.id = :postId', { postId })
        .getOne()
        return likeOrNullDao(output)
    }
    async create(data: CreateLike) {
        const likeEntity = await this.LikeRepo.save(data)
        return likeDao(likeEntity)
    }
    async removeLike(likeId : LikeId) {
        const like = await this.LikeRepo.findOneBy({ id: likeId });
        return like === null ?  likeOrNullDao(null) : likeOrNullDao(await this.LikeRepo.remove(like));
    }
}
