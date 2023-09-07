import { DataSource, Repository, getManager } from 'typeorm'
import { LikeEntity } from './entity/like.entity'
import { UserId } from '../user/model/user-id'
import { likeArrayDao, likeDao, likeOrNullDao } from './bll/like.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { PostWithoutLikesCount } from './model/post'
import { PostId } from './model/post-id'
import { LikeId } from './model/like-id'
import { WholeDate } from '../../data/whole-date'

export interface CreateLike {
    user: User
    post: PostWithoutLikesCount
}
export interface CreatedLike extends CreateLike{
    id: LikeId
    createdAt: WholeDate
    updatedAt: WholeDate
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
    // async delete(data: CreatedLike): Promise<ReturnType<typeof likeDao>> {
    //     const likeEntity = await this.LikeRepo.remove(data)
    //     return likeDao(likeEntity)
    // }
    async removeLikeWithTransaction(likeId : LikeId): Promise<ReturnType<typeof likeOrNullDao>> {
        //const entityManager = getManager();
        const like = await this.LikeRepo.findOneBy({ id: likeId });
        return like === null ?  likeOrNullDao(null) : likeOrNullDao(await this.LikeRepo.remove(like));
      }
    
}
