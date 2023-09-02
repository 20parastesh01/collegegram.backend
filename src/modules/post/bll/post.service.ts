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
type resPosts = Post[] | BadRequestError | ServerError

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId:UserId): Promise<resPost>
    getPost(postId: PostId): Promise<resPost>
    getAllPosts(userId: UserId): Promise<resPosts>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(private postRepo: IPostRepository) {}

    async getAllPosts(userId: UserId): Promise<resPosts> {
        return (await this.postRepo.findAllByAuthor(userId)).toPostModelList()
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId:UserId): Promise<resPost> {
        //const { tags, caption, photosCount , author, closeFriend } = dto
        const photosCount = zodWholeNumber.parse( files.length)
        const createPostRepoInput = newPostModelToRepoInput({...dto , photosCount, author:userId})
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPostModel()
        if (createdPost) {
            //const filesCount = files.length
            await MinioRepo.uploadPostPhoto(createdPost.id, files)
        }
        

        return createdPost ?? new ServerError()
    }

    async getPost(postId: PostId): Promise<resPost> {
        const postEntity = (await this.postRepo.findByID(postId)).toPostModel()
        return postEntity ?? new NotFoundError('post')
    }
}
