import { BadRequestError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { Service } from '../../../registry'
import { CreatePostDTO } from '../dto/createPost.dto'
import { Post } from '../model/post'
import { PostEntity } from '../entity/post.entity'
import { PostId } from '../model/post-id'
import { newPostModelToEntity, toPostModel } from './post.dao'
import { UserId } from '../../user/model/user-id'

type GetCreatePost = Post | BadRequestError | ServerError

export interface IPostService {
  createPost(data: CreatePostDTO): Promise<GetCreatePost>
  getPost(postId: PostId): Promise<Post | null>;
  getAllPost(userId: UserId): Promise<Post[] | null>;
}

@Service(PostRepository)
export class PostService implements IPostService {
  constructor(private postRepo: IPostRepository) { }


  getAllPost(userId: UserId): Promise<Post[] | null> {
    return this.postRepo.findAllByAuthor(userId);
  }



  async createPost(dto: CreatePostDTO): Promise<PostEntity> {
    const { tags, caption, images, author, closeFriend } = dto;
    //Refactor:
    // const post = {
    //   caption: caption,
    //   tags: tags,
    //   photos: images,
    //   author: author,
    //   closeFriend: closeFriend,
    // };

    const postEntity = newPostModelToEntity({
      tags, caption, photos: images, author, closeFriend
    })
    const createdPost = await this.postRepo.create(postEntity);
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
