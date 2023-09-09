import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { PostWithLikeCount, PostWithoutLikeCount } from '../model/post'
import { PostId } from '../model/post-id'
import { newPostModelToRepoInput } from './post.dao'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { zodWholeNumber } from '../../../data/whole-number'
import { ILikeRepository, LikeRepository } from '../like.repository'
import { IUserRepository, UserRepository } from '../../user/user.repository'
import { likeWithoutIdModelToCreateLikeEntity } from './like.dao'
import { LikeWithId } from '../model/like'

type resPost = PostWithLikeCount | PostWithoutLikeCount | LikeWithId | BadRequestError | ServerError | NotFoundError
type resPosts = { result: PostWithLikeCount[]; total: number } | BadRequestError | ServerError

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resPost>
    getPost(postId: PostId): Promise<resPost>
    getAllPosts(userId: UserId): Promise<resPosts>
    likePost(userId: UserId,postId: PostId): Promise<resPost>
    unlikePost(userId: UserId,postId: PostId): Promise<resPost>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private likeRepo: ILikeRepository,
        private readonly userRepo: IUserRepository
        ) {}
    
    async likePost(userId: UserId, postId: PostId): Promise<resPost> {
        const like = (await this.likeRepo.findLikeByUserAndPost(userId, postId)).toLikeModel();
        if (!like) {
            const user = (await this.userRepo.findById(userId))?.toUser()
            const post = (await this.postRepo.findPostWithoutLikeCountByID(postId)).toPostModel()
            if(user && post) {
                const input = likeWithoutIdModelToCreateLikeEntity(user, post)
                const createdLike = (await this.likeRepo.create(input)).toLikeModel()
                return createdLike
            }
            return new BadRequestError('postId or userId not exist.')
        }
        return new BadRequestError('Post Already liked by current user.')
    }
    async unlikePost(userId: UserId, postId: PostId): Promise<resPost> {
        const like = (await this.likeRepo.findLikeByUserAndPost(userId, postId)).toLikeModel();
        if (!like) {
            return new BadRequestError('Post did not like by current user.');
        }
          
        const result = (await this.likeRepo.removeLike(like.id)).toLikeModel();
        return result ?? new ServerError
    }

    async getAllPosts(userId: UserId): Promise<resPosts> {
        const result = (await this.postRepo.findAllByAuthor(userId)).toPostModelList()
        for (let post of result) {
            const photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            if (photos) {
                post.photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            }
        }
        return { result, total: result.length }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resPost> {
        //const { tags, caption, photosCount , author, closeFriend } = dto
        const photosCount = zodWholeNumber.parse(files.length)
        const createPostRepoInput = newPostModelToRepoInput({ ...dto, photosCount, author: userId })
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPostModel()
        if (createdPost) {
            const photos = await MinioRepo.getPostPhotoUrl(createdPost.id, createdPost.photosCount)
            if (photos) {
                createdPost.photos = await MinioRepo.getPostPhotoUrl(createdPost.id, createdPost.photosCount)
            }
            await MinioRepo.uploadPostPhoto(createdPost.id, files)
        }

        return createdPost ?? new ServerError()
    }

    async getPost(postId: PostId): Promise<resPost> {
        const post = (await this.postRepo.findPostWithLikeCountByID(postId)).toPostModel()
        if (post) {
            const photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            if (photos) {
                post.photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            }
        }
        return post ?? new NotFoundError()
    }
}
