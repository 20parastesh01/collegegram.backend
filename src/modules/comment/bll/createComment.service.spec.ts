import { WholeNumber } from "../../../data/whole-number";
import { UserId, isUserId, zodUserId } from "../../user/model/user-id";
import { CreatePostDTO } from "../dto/createComment.dto";
import { PostEntity } from "../entity/comment.entity";
import { Caption, zodCaption } from "../model/content";
import { PostId, zodPostId } from "../model/comment-id";
import { Tag, zodTag } from "../model/tag";
import { IPostRepository } from "../comment.repository";
import { PostService } from "./comment.service";

describe('PostService', () => {
  let postService: PostService;
  let mockPostRepository: jest.Mocked<IPostRepository>;

  beforeEach(() => {
    mockPostRepository = {
      create: jest.fn(),
    } as any;

    postService = new PostService(mockPostRepository);
  });

  it('should create a post', async () => {
    const mockDto = {
      tags: ["tag1", "tag2", "tag3"] as Tag[],
      caption: 'Test caption' as Caption,
      closeFriend: false,
      images: ['image1.jpg', 'image2.jpg'],
      authorId: 123 as UserId,
    };

    const validatedTags = zodTag.parse(mockDto.tags);
    const validatedCaption = zodCaption.parse(mockDto.caption);
    const validatedAuthorId = zodUserId.parse(mockDto.authorId);
    const validatedId = zodPostId.parse(1);

    const mockCreatedPost: PostEntity = {
      id: validatedId,
      caption: validatedCaption,
      tags: validatedTags,
      photos: mockDto.images,
      author: validatedAuthorId,
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