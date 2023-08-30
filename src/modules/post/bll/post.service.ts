import { BadRequestError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { Service } from '../../../registry'
import { CreatePostDTO } from '../dto/createPost.dto'
import { Post } from '../model/post'
import { PostEntity } from '../entity/post.entity'
import { zodTag } from '../model/tag'
import { zodCaption } from '../model/caption'
import { GetPostDTO } from '../dto/getPost.dto'
import { BRAND } from 'zod'
import { PostId } from '../model/post-id'
import { toPostModel } from './post.dao'

type GetCreatePost = Post | BadRequestError | ServerError

export interface IPostService {
    createPost(data: CreatePostDTO): Promise<GetCreatePost>
    getPost(postId: PostId): Promise<Post | null>;
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(private postRepo: IPostRepository) {}

    async createPost(dto: CreatePostDTO): Promise<PostEntity> {
        const { tags, caption, images, authorId, closeFriend } = dto;
    
        const validatedTags = tags.split(' ').map(tag => zodTag.parse(tag));
        const validatedCaption = zodCaption.parse(caption);
    
        const post = {
          caption: validatedCaption,
          tags: validatedTags,
          photos: images,
          author: authorId,
          closeFriend: closeFriend,
        };
    
        const createdPost = await this.postRepo.create(post);
        return createdPost;
      }
      async getPost(postId: PostId): Promise<Post | null> {
        const postEntity = await this.postRepo.findByID(postId);
        if (postEntity) {
          return toPostModel(postEntity);
        }
        return null;
      }
}
