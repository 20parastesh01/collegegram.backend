import { BadRequestError, ServerError, UnauthorizedError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../comment.repository'
import { Service } from '../../../registry'
import { CreatePostDTO } from '../dto/createComment.dto'
import { Post } from '../model/comment'
import { PostEntity } from '../entity/comment.entity'
import { PostId } from '../model/comment-id'
import { newPostModelToEntity, toPostModel } from './comment.dao'
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
    const { tags, caption, images, authorId, closeFriend } = dto;
    //Refactor:
    //const validatedTags = tags.split(' ').map(tag => zodTag.parse(tag));

    //const validatedCaption = zodCaption.parse(caption);
    //const validatedCaption :Caption = caption;

    // const post = {
    //   caption: caption,
    //   tags: tags,
    //   photos: images,
    //   author: authorId,
    //   closeFriend: closeFriend,
    // };

    const postEntity = newPostModelToEntity({
      tags, caption, photos: images, author: authorId, closeFriend
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
