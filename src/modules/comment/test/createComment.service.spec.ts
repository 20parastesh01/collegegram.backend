import { WholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { CommentService } from '../bll/comment.service'
import { ICommentRepository } from '../comment.repository'
import { Content } from '../model/content'
import { CommentId } from '../model/comment-id'
import { Comment } from '../model/comment'
import { mockJustId, mockPostId, mockUser } from '../../../data/fakeData'
import { IUserService } from '../../user/bll/user.service'
import { IPostService } from '../../post/bll/post.service'
const mockcreateCommentDto = {
    content: 'Test content' as Content,
    postId: mockJustId.id1,
    parentId: 1 as CommentId,
}

const userId = 123 as UserId

const mockCreatedComment: Comment = {
    id: 1 as CommentId,
    content: mockcreateCommentDto.content,
    author: mockUser[0],
    likeCount: 0 as WholeNumber,
    parentId: mockcreateCommentDto.parentId,
    postId: mockPostId.postId1,
    createdAt: new Date()
}
const commentDao = (input: Comment) => {
    return {
        toComment(): Comment {
            return input
        },
    }
}
describe('CommentService', () => {
    let commentService: CommentService
    let mockCommentRepository: jest.Mocked<ICommentRepository>
    let userService: jest.Mocked<IUserService>
    let postService: jest.Mocked<IPostService>

    beforeEach(() => {
        mockCommentRepository = {
            create: jest.fn(),
        } as any

        commentService = new CommentService(mockCommentRepository, userService, postService)
    })

    it('should create a comment', async () => {
        mockCommentRepository.create.mockResolvedValue(commentDao(mockCreatedComment))

        const result = await commentService.createComment(mockcreateCommentDto, userId)

        expect(result).toEqual(mockCreatedComment)
        expect(mockCommentRepository.create).toHaveBeenCalledWith({ ...mockcreateCommentDto, likeCount: 0 as WholeNumber, author: 123 as UserId })
    })
})
