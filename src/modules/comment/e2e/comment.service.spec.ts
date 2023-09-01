import { WholeNumber } from '../../../data/whole-number';
import { UserId, zodUserId } from '../../user/model/user-id';
import { ICommentService, CommentService } from '../bll/comment.service';
import { CreateCommentDTO } from '../dto/createComment.dto';
import { CommentEntity } from '../entity/comment.entity';
import { Content, zodContent } from '../model/content';
import { CommentId, zodCommentId } from '../model/comment-id';
import { ICommentRepository } from '../comment.repository';
import { PostId, zodPostId } from '../../post/model/post-id';
import { zodParentId } from '../model/parent-id';

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
      parentId: null,
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


    mockCommentRepository.create.mockResolvedValue(mockCreatedComment);


    const result = await commentService.createComment(mockDto);


    expect(result).toEqual(mockCreatedComment);
    expect(mockCommentRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockDto));
  });
});