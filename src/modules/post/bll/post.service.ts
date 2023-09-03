import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { Post } from '../model/post'
import { PostId } from '../model/post-id'
import { newPostModelToRepoInput } from './post.dao'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { zodWholeNumber } from '../../../data/whole-number'

type resPost = Post | BadRequestError | ServerError | NotFoundError
type resPosts = { result: Post[]; total: number } | BadRequestError | ServerError

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resPost>
    getPost(postId: PostId): Promise<resPost>
    getAllPosts(userId: UserId): Promise<resPosts>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(private postRepo: IPostRepository) {}

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
        const post = (await this.postRepo.findByID(postId)).toPostModel()
        if (post) {
            const photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            if (photos) {
                post.photos = await MinioRepo.getPostPhotoUrl(post.id, post.photosCount)
            }
        }
        return post ?? new NotFoundError()
    }
}
