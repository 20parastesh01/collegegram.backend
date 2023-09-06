import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { PostWithLikesCount, PostWithoutLikesCount } from '../model/post'
import { PostId } from '../model/post-id'
import { newPostModelToRepoInput } from './post.dao'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { zodWholeNumber } from '../../../data/whole-number'
import { LikeRepository } from '../like.repository'
import { UserRepository } from '../../user/user.repository'
import { likeWithoutIdModelToRepoInput } from './like.dao'

type resPost = PostWithLikesCount | PostWithoutLikesCount | BadRequestError | ServerError | NotFoundError
type resPosts = { result: PostWithLikesCount[]; total: number } | BadRequestError | ServerError

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resPost>
    getPost(postId: PostId): Promise<resPost>
    getAllPosts(userId: UserId): Promise<resPosts>
    likePost(userId: UserId,postId: PostId): Promise<resPosts>
    unlikePost(userId: UserId,postId: PostId): Promise<resPosts>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private readonly likeRepo: LikeRepository,
        private readonly userRepo: UserRepository
        ) {}
    
    async likePost(userId: UserId, postId: PostId): Promise<resPosts> {
        const like = await this.likeRepo.findLikeByUserAndPost(userId, postId);
        if (like) {
            const user = await this.userRepo.findById(userId)
            const post = await this.postRepo.findPostWithoutLikesCountByID(postId)
            if (user?.toUser() && post.toPostModel()!== null) {
                const input = likeWithoutIdModelToRepoInput(user.toUser(), post.toPostModel())
                const createdLike = (await this.likeRepo.create(input)).toLikeModel() 
            }
            else return new BadRequestError('not exist.')
        }
        else 
        return new BadRequestError('Already liked.')
    }
    unlikePost(userId: UserId, postId: PostId): Promise<resPosts> {
        throw new BadRequestError('Already liked.')
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
        const post = (await this.postRepo.findPostWithLikesCountByID(postId)).toPostModel()
        if (post) {
            const photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            if (photos) {
                post.photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            }
        }
        return post ?? new NotFoundError()
    }
}
