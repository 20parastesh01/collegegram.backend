import { Readable } from 'stream'
import { WholeNumber } from '../../../data/whole-number'
import { UserId, zodUserId } from '../../user/model/user-id'
import { CommentService } from './comment.service'
import { ICommentRepository } from '../comment.repository'
import { Content } from '../model/content'
import { Post } from '../../post/model/post'
import { PostId } from '../../post/model/post-id'
import { CommentId, zodCommentId } from '../model/comment-id'
import { ParentId } from '../model/parent-id'
import { Comment } from '../model/comment'

describe('CommentService', () => {
    let commentService: CommentService
    let mockCommentRepository: jest.Mocked<ICommentRepository>

    beforeEach(() => {
        mockCommentRepository = {
            create: jest.fn(),
        } as any

        commentService = new CommentService(mockCommentRepository)
    })

    it('should create a comment', async () => {
        const mockcreateCommentDto = {
            content: 'Test content' as Content,
            postId: 123 as PostId,
            parentId: 1 as ParentId,
        }
        const userId = 123 as UserId

        const mockCreatedComment: Comment = {
            id: 1 as CommentId,
            content: mockcreateCommentDto.content,
            author: userId,
            likesCount: 0 as WholeNumber,
            parentId: mockcreateCommentDto.parentId,
            postId: mockcreateCommentDto.postId,
        }
        const commentDao = (input: Comment) => {
            return {
                toCommentModel(): Comment {
                    return input
                },
            }
        }

        mockCommentRepository.create.mockResolvedValue(commentDao(mockCreatedComment))

        const result = await commentService.createComment(mockcreateCommentDto, userId)

        expect(result).toEqual(mockCreatedComment)
        expect(mockCommentRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockcreateCommentDto))
    })
})
