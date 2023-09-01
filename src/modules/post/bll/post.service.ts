import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { Service } from '../../../registry'
import { CreatePostDTO } from '../dto/createPost.dto'
import { Post } from '../model/post'
import { PostId } from '../model/post-id'
import { newPostModelToRepoInput,  } from './post.dao'
import { UserId } from '../../user/model/user-id'

type resPost = Post | BadRequestError | ServerError | NotFoundError
type resPosts = Post[] | BadRequestError | ServerError

export interface IPostService {
  createPost(data: CreatePostDTO): Promise<resPost>
  getPost(postId: PostId): Promise<resPost>;
  getAllPosts(userId: UserId): Promise<resPosts>;
}

@Service(PostRepository)
export class PostService implements IPostService {
  constructor(private postRepo: IPostRepository) { }


  async getAllPosts(userId: UserId): Promise<resPosts> {
    return (await this.postRepo.findAllByAuthor(userId)).toPostModelList();
  }

  async createPost(dto: CreatePostDTO): Promise<resPost> {
    const { tags, caption, images, author, closeFriend } = dto;

    const createPostRepoInput = newPostModelToRepoInput({
      tags, caption, photos: images, author, closeFriend
    })
    const createdPost = (await this.postRepo.create(createPostRepoInput)).toPostModel();
    return createdPost ?? new ServerError()
  }

  async getPost(postId: PostId): Promise<resPost> {
    const postEntity = (await this.postRepo.findByID(postId)).toPostModel();
      return postEntity ?? new NotFoundError('post');
  }
}
