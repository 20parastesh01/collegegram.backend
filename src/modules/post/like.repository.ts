import { DataSource, Repository } from 'typeorm'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { LikeId } from './model/like-id'
import { LikeEntity } from './entity/like.entity'
import { UserId } from '../user/model/user-id'
import { WholeNumber } from '../../data/whole-number'
import { likeArrayDao, likeDao, likeOrNullDao } from './bll/like.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { PostWithoutLikesCount } from './model/post'
import { PostId } from './model/post-id'

export interface CreateLike {
    user: User
    post: PostWithoutLikesCount
}

export interface ILikeRepository {
    create(data: CreateLike): Promise<ReturnType<typeof likeDao>>
    findByUser(user: User): Promise<ReturnType<typeof likeArrayDao>>
}

@Repo()
export class LikeRepository implements ILikeRepository {
    private LikeRepo: Repository<LikeEntity>

    constructor(appDataSource: DataSource) {
        this.LikeRepo = appDataSource.getRepository(LikeEntity)
    }
    async findByUser(user: User): Promise<ReturnType<typeof likeArrayDao>> {
        const likes: LikeEntity[] = await this.LikeRepo.find({
            where: {
                user: user,
            },
            order: {
                createdAt: 'DESC', // Sort by createdAt in descending order
            },
        })
        return likeArrayDao(likes)
    }
    async findLikeByUserAndPost(userId: UserId, postId: PostId): Promise<ReturnType<typeof likeOrNullDao>> {
        const output = await this.LikeRepo.findOne({
            where: {
              user: { id: userId },
              post: { id: postId },
            },
          });
        return likeOrNullDao(output)
    }
    async create(data: CreateLike): Promise<ReturnType<typeof likeDao>> {
        const likeEntity = await this.LikeRepo.save(data)
        return likeDao(likeEntity)
    }
}
