import { WholeNumber } from '../../../data/whole-number';
import { UserId } from '../../user/model/user-id';
import { IPostService, PostService } from '../bll/comment.service';
import { CreatePostDTO } from '../dto/createComment.dto';
import { PostEntity } from '../entity/comment.entity';
import { Caption } from '../model/content';
import { PostId } from '../model/comment-id';
import { Tag } from '../model/tag';
import { IPostRepository } from '../comment.repository';

describe('PostService e2e', () => {
  let postService: IPostService;
  let mockPostRepository: jest.Mocked<IPostRepository>;

  beforeEach(() => {

    mockPostRepository = {
      create: jest.fn(),
      findByID: jest.fn(),
      findAllByAuthor: jest.fn(),
    };


    postService = new PostService(mockPostRepository);
  });

  it('should create a post', async () => {

    const mockDto: CreatePostDTO = {
      tags: ["tag1", "tag2", "tag3"] as Tag[],
      caption: 'Test caption' as Caption,
      closeFriend: false,
      images: ['image1.jpg', 'image2.jpg'],
      authorId: 123 as UserId,
    };


    const mockCreatedPost: PostEntity = {
      id: 1 as PostId,
      caption: mockDto.caption,
      tags: mockDto.tags,
      photos: mockDto.images,
      author: mockDto.authorId,
      closeFriend: mockDto.closeFriend,
      likesCount: 1 as WholeNumber,
      commentsCount: 1 as WholeNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };


    mockPostRepository.create.mockResolvedValue(mockCreatedPost);


    const result = await postService.createPost(mockDto);


    expect(result).toEqual(mockCreatedPost);
    expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockDto));
  });
});