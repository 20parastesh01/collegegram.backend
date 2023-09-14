
import { IPostRepository } from '../post.repository'
import { IUserRepository } from '../../user/user.repository'
import { PostService } from '../bll/post.service'
import { messages } from '../../../utility/persian-messages'
import { mockCreatedPost, mockFiles, mockJustId, mockPostId, mockUserId, mockcreatePostDto, postArrayDao, postWithLikeOrNullDao, postWithoutLikeDao } from '../../../data/fakeData'
import { IBookmarkRepository } from '../../postAction/bookmark.repository'
import { ILikeRepository } from '../../postAction/like.repository'


describe('PostService', () => {
    let postService: PostService
    let mockPostRepository: jest.Mocked<IPostRepository>
    let mockLikeRepository: jest.Mocked<ILikeRepository>
    let mockBookmarkRepository: jest.Mocked<IBookmarkRepository>
    let mockUserRepository: jest.Mocked<IUserRepository>

    beforeEach(() => {
        mockPostRepository = {
            findByID: jest.fn(),
            create: jest.fn(),
            findWithDetailByID: jest.fn(),
            findWithoutDetailByID: jest.fn(),
            findAllByAuthor: jest.fn(),
        } as any
        mockLikeRepository = {
            create : jest.fn(),
            findByUserAndPost: jest.fn(),
            remove : jest.fn(),
        } as any
        mockBookmarkRepository = {
            create : jest.fn(),
            findByUserAndPost: jest.fn(),
            remove : jest.fn(),
        } as any
        mockUserRepository = {
            findById: jest.fn()
        } as any
        postService = new PostService(mockPostRepository, mockUserRepository)
    })


    it('should create a post', async () => {
        
        mockPostRepository.create.mockResolvedValue(postWithoutLikeDao(mockCreatedPost[0]))

        const result = await postService.createPost(mockcreatePostDto, mockFiles, mockUserId)
        if ('photos' in result.data[0]) {
            delete result.data[0].photos
        }
        const {id,...rest} = mockCreatedPost[0]
        expect(result.data[0]).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(rest))
    })

    it('should get a post', async () => {
        
        mockPostRepository.findWithDetailByID.mockResolvedValue(postWithLikeOrNullDao(mockCreatedPost[0]))
        const result = await postService.getPost(mockJustId.id1)
        if ('photos' in result.data[0]) {
            delete result.data[0].photos
        }
        expect(result.data[0]).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.findWithDetailByID).toHaveBeenCalledWith(mockPostId.postId1)
    })

    it('should get all post of user', async () => {
        
        mockPostRepository.findAllByAuthor.mockResolvedValue(postArrayDao(mockCreatedPost))
        const result = await postService.getAllPosts(mockUserId)
        if (Array.isArray(result.data)) {
            delete result.data[0].result[0].photos
            delete result.data[0].result[1].photos
        }
        
        expect(result.data[0]).toEqual({result:mockCreatedPost,total:2})
        expect(mockPostRepository.findAllByAuthor).toHaveBeenCalledWith(mockUserId)
    })
})
