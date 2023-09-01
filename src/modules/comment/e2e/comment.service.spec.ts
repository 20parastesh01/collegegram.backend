import { WholeNumber } from '../../../data/whole-number';
import { UserId, zodUserId } from '../../user/model/user-id';
import { ICommentService, CommentService } from '../bll/comment.service';
import { CreateCommentDTO } from '../dto/createComment.dto';
import { CommentEntity } from '../entity/comment.entity';
import { Content, zodContent } from '../model/content';
import { zodCommentId } from '../model/comment-id';
import { ICommentRepository } from '../comment.repository';
import { PostId, zodPostId } from '../../post/model/post-id';
import { ParentId, zodParentId } from '../model/parent-id';
import { commentDao } from '../bll/comment.dao';

describe('CommentService e2e', () => {
  let commentService: ICommentService;
  let mockCommentRepository: jest.Mocked<ICommentRepository>;

  beforeEach(() => {

    mockCommentRepository = {
      create: jest.fn(),
      findAllByPost: jest.fn(),
    } as any;


    commentService = new CommentService(mockCommentRepository);
  });

  it('should create a comment', async () => {

    const mockDto: CreateCommentDTO = {
      content: 'Test content' as Content,
      postId: 123 as PostId,
      parentId: undefined,
      author: 123 as UserId,
    };

    const validatedPostId = zodPostId.parse(mockDto.postId);
    const validatedParentId = zodParentId.parse(mockDto.parentId);
    const validatedContent = zodContent.parse(mockDto.content);
    const validatedAuthor = zodUserId.parse(mockDto.author);
    const validatedId = zodCommentId.parse(1);

    const mockCreatedComment: CommentEntity = {
      id: validatedId,
      postId: validatedPostId,
      parentId: validatedParentId,
      content: validatedContent,
      author: validatedAuthor,
      likesCount: 1 as WholeNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const data = commentDao(mockCreatedComment)


    mockCommentRepository.create.mockResolvedValue(data);


    const result = await commentService.createComment(mockDto);


    expect(result).toEqual(data.toCommentModel());
    expect(mockCommentRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockDto));
  });
  it('should get comments list for a post', async () => {

    const mockPostId: PostId = 123 as PostId;

    const mockDto: CreateCommentDTO = {
      content: 'Test content' as Content,
      postId: 123 as PostId,
      parentId: undefined,
      author: 123 as UserId,
    };
    const validatedPostId = zodPostId.parse(mockDto.postId);
    const validatedParentId1 = zodParentId.parse(mockDto.parentId);
    const validatedParentId2 = zodParentId.parse(2 as ParentId);
    const validatedContent = zodContent.parse(mockDto.content);
    const validatedAuthor = zodUserId.parse(mockDto.author);
    const validatedId1 = zodCommentId.parse(12);
    const validatedId2 = zodCommentId.parse(23);


    //mockCommentRepository.create.mockResolvedValue(mockCreatedComment1);


    //mockCommentRepository.findAllByPost.mockResolvedValue(mockPostId);

    const mockCommentList: CommentEntity[] = [
      {
        id: validatedId1,
        postId: validatedPostId,
        parentId: validatedParentId1,
        content: validatedContent,
        author: validatedAuthor,
        likesCount: 1 as WholeNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: validatedId2,
        postId: validatedPostId,
        parentId: validatedParentId2,
        content: validatedContent,
        author: validatedAuthor,
        likesCount: 1 as WholeNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    const data = commentDao(mockCommentList)
    mockCommentRepository.findAllByPost.mockResolvedValue(data);

    const result = await commentService.getAllComments(mockPostId);


    expect(result).toEqual(data.toCommentModelList);
    //expect(mockCommentRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockDto));
  });
});