import { QueryFailedError } from 'typeorm'
import { BadRequestError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import bcrypt from 'bcryptjs'
import { compareHash, createSession, generateToken } from '../../../utility/auth'
import { Hashed } from '../../../data/hashed'
import { Token } from '../../../data/token'
import { RedisRepo } from '../../../data-source'
import { BRAND } from 'zod'
import { IPostRepository, PostRepository } from '../post.repository'
import { Service } from '../../../registry'
import { CreatePostDTO } from '../dto/createPost.dto'
import { Post } from '../model/post'
import { PostEntity } from '../entity/post.entity'
import { zodTag } from '../model/tag'
import { zodCaption } from '../model/caption'

type GetCreatePost = Post | BadRequestError | ServerError

export interface IPostService {
    createPost(data: CreatePostDTO): Promise<GetCreatePost>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(private postRepository: IPostRepository) {}

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
    
        const createdPost = await this.postRepository.create(post);
        return createdPost;
      }
}
