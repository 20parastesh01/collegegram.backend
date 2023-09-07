import { DataSource, EntityManager, Repository, getManager } from 'typeorm'
import { LikeEntity } from './entity/like.entity'
import { UserId } from '../user/model/user-id'
import { likeArrayDao, likeDao, likeOrNullDao } from './bll/like.dao'
import { Repo } from '../../registry/layer-decorators'
import { User } from '../user/model/user'
import { PostWithoutLikesCount } from './model/post'
import { PostId } from './model/post-id'
import { LikeId } from './model/like-id'
import { WholeDate } from '../../data/whole-date'
import { UserEntity } from '../user/entity/user.entity'
import { PostEntity } from './entity/post.entity'
import { UserRepository } from '../user/user.repository'
import { PostRepository } from './post.repository'

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
    removeLikeWithTransaction(likeId : LikeId): Promise<ReturnType<typeof likeOrNullDao>>
}

@Repo()
export class LikeRepository implements ILikeRepository {
    private LikeRepo: Repository<LikeEntity>
    private UserRepo: Repository<UserEntity>
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.LikeRepo = appDataSource.getRepository(LikeEntity)
        this.UserRepo = appDataSource.getRepository(UserEntity)
        this.PostRepo = appDataSource.getRepository(PostEntity)
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
    // async delete(data: CreatedLike): Promise<ReturnType<typeof likeDao>> {
    //     const likeEntity = await this.LikeRepo.remove(data)
    //     return likeDao(likeEntity)
    // }
    async removeLikeWithTransaction(likeId : LikeId): Promise<ReturnType<typeof likeOrNullDao>> {
        const like = await this.LikeRepo.findOneBy({ id: likeId });
        return like === null ?  likeOrNullDao(null) : likeOrNullDao(await this.LikeRepo.remove(like));
    }
    async removeLikeWithTransaction1(likeId : LikeId): Promise<ReturnType<typeof likeOrNullDao>> {

        const like = await this.LikeRepo.findOneBy({ id: likeId });
        if(like === null)  return likeOrNullDao(null)
        const likeToDelete : LikeEntity= {...like};
        const updatedUser : UserEntity = { ...like.user, likes: like.user.likes.filter(like => like.id !== likeToDelete.id)}
        const updatedPost : PostEntity= { ...like.post, likes: like.post.likes.filter(like => like.id !== likeToDelete.id)}

        const entityManager = getManager();
        
        try {
            await entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
                // const likeRepository = transactionalEntityManager.getCustomRepository(LikeRepository);    
                // const userRepository = transactionalEntityManager.getCustomRepository(UserRepository);
                // const postRepository = transactionalEntityManager.getCustomRepository(PostRepository);
                //await likeRepository.remove(LikeEntity, likeToDelete);
                // await userRepository.save(UserEntity, updatedUser);
                // await postRepository.save(PostEntity, updatedPost);     
                const like = transactionalEntityManager.withRepository(this.LikeRepo).remove(likeToDelete)
                const user = transactionalEntityManager.withRepository(this.UserRepo).save(updatedUser)
                const post = transactionalEntityManager.withRepository(this.PostRepo).save(updatedPost)
            });
            
            return likeOrNullDao(like)
          } catch (error) {
            return likeOrNullDao(null)
          }
        

    }
}
