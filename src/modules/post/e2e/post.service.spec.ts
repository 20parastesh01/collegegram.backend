import { WholeNumber } from '../../../data/whole-number';
import { UserId } from '../../user/model/user-id';
import { IPostService, PostService } from '../bll/post.service';
import { CreatePostDTO } from '../dto/createPost.dto';
import { PostEntity } from '../entity/post.entity';
import { Caption } from '../model/caption';
import { PostId } from '../model/post-id';
import { Tag } from '../model/tag';
import { IPostRepository } from '../post.repository';

describe('PostService e2e', () => {
    let postService: IPostService;
    let mockPostRepository: jest.Mocked<IPostRepository>;
  
    beforeEach(() => {
      // Mock the PostRepository
      mockPostRepository = {
        create: jest.fn(),
      };
  
      // Create an instance of the PostService with the mock repository
      postService = new PostService(mockPostRepository);
    });
  
    it('should create a post', async () => {
      // Mock data for the DTO
      const mockDto: CreatePostDTO = {
        tags: 'tag1 tag2 tag3' as Tag,
        caption: 'Test caption' as Caption,
        closeFriend: false,
        images: ['image1.jpg', 'image2.jpg'],
        authorId: 123 as UserId,
      };
  
      // Mock data for the created post
      const mockCreatedPost: PostEntity = {
        id: 1 as PostId,
        caption: mockDto.caption,
        tags: [mockDto.tags],
        photos: mockDto.images,
        author: mockDto.authorId,
        closeFriend: mockDto.closeFriend,
        likesCount: 1 as WholeNumber,
        commentsCount: 1 as WholeNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      // Manually resolve the promise with mockCreatedPost
      mockPostRepository.create.mockResolvedValue(mockCreatedPost);

      // Perform the action: Call the createPost method of the PostService
      const result = await postService.createPost(mockDto);
  
      // Assertions
      expect(result).toEqual(mockCreatedPost);
      expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockDto));
    });
  });