
import { IPostRepository } from '../post.repository'
import { ILikeRepository } from '../like.repository'
import { IUserRepository } from '../../user/user.repository'
import { PostService } from '../bll/post.service'
import { messages } from '../../../utility/persian-messages'
import { likeDao, likeOrNullDao, mockCreatedLike, mockCreatedPost, mockFiles, mockJustId, mockLikeDto, mockPostId, mockPostWithoutLikeCount, mockUser, mockUserId, mockcreatePostDto, postArrayDao, postWithLikeOrNullDao, postWithoutLikeDao, postWithoutLikeOrNullDao, userDao } from '../../../data/fakeData'




describe('PostService', () => {
    let postService: PostService
    let mockPostRepository: jest.Mocked<IPostRepository>
    let mockLikeRepository: jest.Mocked<ILikeRepository>
    let mockUserRepository: jest.Mocked<IUserRepository>

    beforeEach(() => {
        mockPostRepository = {
            findByID: jest.fn(),
            create: jest.fn(),
            findPostWithLikeCountByID: jest.fn(),
            findPostWithoutLikeCountByID: jest.fn(),
            findAllByAuthor: jest.fn(),
        } as any
        mockLikeRepository = {
            findLikeByUserAndPost: jest.fn(),
            create : jest.fn(),
            findByUserAndPost: jest.fn(),
            removeLike : jest.fn(),
        } as any
        mockUserRepository = {
            findById: jest.fn()
        } as any
        postService = new PostService(mockPostRepository, mockLikeRepository, mockUserRepository)
    })


    it('should create a post', async () => {
        
        mockPostRepository.create.mockResolvedValue(postWithoutLikeDao(mockCreatedPost[0]))

        const result = await postService.createPost(mockcreatePostDto, mockFiles, mockUserId)
        if ('photos' in result) {
            delete result.photos
        }
        const {id,...rest} = mockCreatedPost[0]
        expect(result).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(rest))
    })

    it('should get a post', async () => {
        
        mockPostRepository.findPostWithLikeCountByID.mockResolvedValue(postWithLikeOrNullDao(mockCreatedPost[0]))
        const result = await postService.getPost(mockJustId.id1)
        if ('photos' in result) {
            delete result.photos
        }
        expect(result).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.findPostWithLikeCountByID).toHaveBeenCalledWith(expect(mockPostId.postId1))
    })

    it('should get all post of user', async () => {
        
        mockPostRepository.findAllByAuthor.mockResolvedValue(postArrayDao(mockCreatedPost))
        const result = await postService.getAllPosts(mockUserId)
        if (Array.isArray(result)) {
            delete result[0].photos
            delete result[1].photos
        }
        
        expect(result).toEqual({result:mockCreatedPost,total:2})
        expect(mockPostRepository.findPostWithLikeCountByID).toHaveBeenCalledWith(expect(mockUserId))
    })

    it('should like a post', async () => {
        
        mockLikeRepository.create.mockResolvedValue(likeDao(mockCreatedLike))
        mockLikeRepository.findByUserAndPost.mockResolvedValue(likeOrNullDao(null))
        mockPostRepository.findPostWithoutLikeCountByID.mockResolvedValue(postWithoutLikeOrNullDao(mockPostWithoutLikeCount))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser))
        const result = await postService.likePost(mockLikeDto.user.id,mockJustId.id1)

        expect(result).toEqual({ msg: messages.liked.persian })
        expect(mockLikeRepository.create).toHaveBeenCalledWith(expect.objectContaining({post:mockPostWithoutLikeCount,user:mockUser}))
    })
    it('should unlike a post', async () => {
        
        mockLikeRepository.removeLike.mockResolvedValue(likeOrNullDao(mockCreatedLike))
        mockLikeRepository.findByUserAndPost.mockResolvedValue(likeOrNullDao(mockCreatedLike))
        mockPostRepository.findPostWithoutLikeCountByID.mockResolvedValue(postWithoutLikeOrNullDao(mockPostWithoutLikeCount))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser))
        const result = await postService.unlikePost(mockLikeDto.user.id,mockJustId.id1)

        expect(result).toEqual({ msg: messages.unliked.persian })
        expect(mockLikeRepository.removeLike).toHaveBeenCalledWith(expect(mockCreatedLike.id))
    })


})
