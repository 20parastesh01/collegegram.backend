
import { IPostRepository } from '../post.repository'
import { PostService } from '../bll/post.service'
import { mockCreatedPost, mockFiles, mockJustId, mockPostId, mockRelation, mockUser, mockUserId, mockcreatePostDto, postArrayDao, postWithDetailOrNullDao, postWithoutDetailDao, relationDao } from '../../../data/fakeData'
import { PostWithDetail } from '../model/post'
import { IRelationService } from '../../user/bll/relation.service'
import { IUserService } from '../../user/bll/user.service'


describe('PostService', () => {
    let postService: PostService
    let relationService: jest.Mocked<IRelationService>
    let userService: jest.Mocked<IUserService>
    let mockPostRepository: jest.Mocked<IPostRepository>


    beforeEach(() => {
        mockPostRepository = {
            findByID: jest.fn(),
            create: jest.fn(),
            findWithDetailByID: jest.fn(),
            findWithoutDetailByID: jest.fn(),
            findAllByAuthor: jest.fn(),
            findAllByAuthorList: jest.fn(),
        } as any
        userService = {
            getUserById: jest.fn(),
            getUserListById: jest.fn(),
        } as any
        relationService = {
            getRelations: jest.fn(),
            getFollowing: jest.fn(),
        }as any
        postService = new PostService(mockPostRepository, userService, relationService)
    })


    it('should create a post', async () => {
        
        mockPostRepository.create.mockResolvedValue(postWithoutDetailDao(mockCreatedPost[0]))

        const result = await postService.createPost(mockcreatePostDto, mockFiles, mockUserId.userId1)
        if ('photos' in result.data[0]) {
            delete result.data[0].photos
        }
        const {id,...rest} = mockCreatedPost[0]
        expect(result.data[0]).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(rest))
    })

    it('should get a post', async () => {
        
        mockPostRepository.findWithDetailByID.mockResolvedValue(postWithDetailOrNullDao(mockCreatedPost[0]))
        const result = await postService.getPost(mockJustId.id1)
        if ('photos' in result.data[0]) {
            delete result.data[0].photos
        }
        expect(result.data[0]).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.findWithDetailByID).toHaveBeenCalledWith(mockPostId.postId1)
    })

    it('should get all post of mine', async () => {
        
        mockPostRepository.findAllByAuthor.mockResolvedValue(postArrayDao(mockCreatedPost))
        const result = await postService.getMyPosts(mockUserId.userId1)
        type x = {
            result: PostWithDetail[];
            total: number;
        }[]
        if (Array.isArray(result.data)  && result.data.length > 0 && 'result' in result.data[0] ) {
            result.data[0].result.every((data) => (delete data.photos))
        }
        expect(result.data[0]).toEqual({result:mockCreatedPost,total:2})
        expect(mockPostRepository.findAllByAuthor).toHaveBeenCalledWith(mockUserId)
    })

    it('should get all posts of user', async () => {
        relationService.getRelations.mockResolvedValue({relation: mockRelation, reverseRelation:  undefined,})
        userService.getUserById.mockResolvedValue(mockUser[0])
        mockPostRepository.findAllByAuthor.mockResolvedValue(postArrayDao(mockCreatedPost))
        const result = await postService.getAllPosts(mockUserId.userId3,mockJustId.id1)
        if (Array.isArray(result.data)  && result.data.length > 0 && 'result' in result.data[0] ) {
            result.data[0].result.every((data) => (delete data.photos))
        }
        expect(result.data[0]).toEqual({result:mockCreatedPost,total:2})
        expect(mockPostRepository.findAllByAuthor).toHaveBeenCalledWith(mockUserId)
    })

    it('should get my timeline', async () => {
        relationService.getFollowing.mockResolvedValue([mockUserId.userId1])
        userService.getUserListById.mockResolvedValue([mockUser[0],mockUser[1]])
        mockPostRepository.findAllByAuthorList.mockResolvedValue(postArrayDao(mockCreatedPost))
        let result = await postService.getMyTimeline(mockUserId.userId2)
        if (Array.isArray(result.data)  && result.data.length > 0 && 'result' in result.data[0] ) {
            result.data[0].result.every((data) => (delete data.post.photos)) 
        }
        expect(result.data[0]).toEqual({result:{user: mockCreatedPost},total:2})
        expect(mockPostRepository.findAllByAuthorList).toHaveBeenCalledWith(mockUserId)
    })
})
