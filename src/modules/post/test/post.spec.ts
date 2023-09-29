import { IPostRepository } from '../post.repository'
import { PostService } from '../bll/post.service'
import { mockCreatedPost, mockFiles, mockJustId, mockPostId, mockRelation, mockUser, mockUserId, mockCreatePostDTO,  postWithDetailOrNullDao, mockEditedPost, postWithoutDetailOrNullDao, mockEditPostDTO } from '../../../data/fakeData'
import { PostWithDetail } from '../model/post'
import { IRelationService } from '../../user/bll/relation.service'
import { IUserService } from '../../user/bll/user.service'
import { HttpError } from '../../../utility/http-error'
import { ICloseFriendService } from '../../user/bll/closefriend.service'

describe('PostService', () => {
    let postService: PostService
    let relationService: jest.Mocked<IRelationService>
    let closeFriendService: jest.Mocked<ICloseFriendService>
    let userService: jest.Mocked<IUserService>
    let mockPostRepository: jest.Mocked<IPostRepository>

    beforeEach(() => {
        mockPostRepository = {
            findByID: jest.fn(),
            create: jest.fn(),
            edit: jest.fn(),
            findWithDetailByID: jest.fn(),
            findWithoutDetailByID: jest.fn(),
            findAllBasicPosts: jest.fn(),
            findAllFullPosts: jest.fn(),
            findAllByAuthorList: jest.fn(),
        } as any
        userService = {
            getUserById: jest.fn(),
            getUserListById: jest.fn(),
        } as any
        relationService = {
            getRelations: jest.fn(),
            getFollowing: jest.fn(),
        } as any
        closeFriendService = {
            getCloseFriend: jest.fn(),
        } as any
        postService = new PostService(mockPostRepository, userService, relationService, closeFriendService)
    })

    it('should create a post', async () => {
        mockPostRepository.create.mockResolvedValue(mockCreatedPost[0])

        const result = await postService.createPost(mockCreatePostDTO, mockFiles, mockUserId.userId1)
        if (!(result instanceof HttpError) && !('msg' in result)) {
            delete result.photos
        }
        const { id, ...rest } = mockCreatedPost[0]
        expect(result).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(rest))
    })
    it('should edit the post', async () => {
        mockPostRepository.edit.mockResolvedValue(mockEditedPost)
       mockPostRepository.findWithoutDetailByID.mockResolvedValue(mockCreatedPost[0])

        const result = await postService.editPost(mockEditPostDTO, mockJustId.id1, mockUserId.userId1)
        if (!(result instanceof HttpError) && !('msg' in result)) {
            delete result.photos
        }
        expect(result).toEqual(mockEditedPost)
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockEditedPost))
    })

    it('should get a post', async () => {
        mockPostRepository.findWithDetailByID.mockResolvedValue(mockCreatedPost[0])
        const result = await postService.getPost(mockJustId.id1, mockUserId.userId1)
        if (!('msg' in result)) {
            delete result.photos
        }
        expect(result).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.findWithDetailByID).toHaveBeenCalledWith(mockPostId.postId1)
    })

    it('should get all post of mine', async () => {
        mockPostRepository.findAllBasicPosts.mockResolvedValue(mockCreatedPost)
       const result = await postService.getMyPosts(mockUserId.userId1)
        type x = {
            result: PostWithDetail[]
            total: number
        }[]
        if (!('msg' in result)) {
            result.result.every((data) => delete data.photos)
        }
        expect(result).toEqual({ result: mockCreatedPost, total: 2 })
        expect(mockPostRepository.findAllBasicPosts).toHaveBeenCalledWith(mockUserId)
    })

    it('should get all posts of user', async () => {
        relationService.getRelations.mockResolvedValue({ relation: mockRelation, reverseRelation: undefined })
        userService.getUserById.mockResolvedValue(mockUser[0])
        mockPostRepository.findAllBasicPosts.mockResolvedValue(mockCreatedPost)
       const result = await postService.getAllPosts(mockUserId.userId3, mockJustId.id1)
        if (!('msg' in result)) {
            result.result.every((data) => delete data.photos)
        }
        expect(result).toEqual({ result: mockCreatedPost, total: 2 })
        expect(mockPostRepository.findAllBasicPosts).toHaveBeenCalledWith(mockUserId)
    })

    it('should get my timeline', async () => {
        relationService.getFollowing.mockResolvedValue([mockUserId.userId1])
        userService.getUserListById.mockResolvedValue([mockUser[0], mockUser[1]])
        mockPostRepository.findAllFullPosts.mockResolvedValue(mockCreatedPost)
       let result = await postService.getMyTimeline(mockUserId.userId2)
        if ('result' in result && Array.isArray(result.result)) {
            result.result.every((data) => delete data.post.photos)
        }
        expect(result).toEqual({ result: { user: mockCreatedPost }, total: 2 })
        expect(mockPostRepository.findAllFullPosts).toHaveBeenCalledWith(mockUserId)
    })
})
