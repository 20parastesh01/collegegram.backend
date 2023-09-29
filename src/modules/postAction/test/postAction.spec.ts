import { ILikeRepository } from '../like.repository'
import { messages } from '../../../utility/persian-messages'
import { bookmarkArrayDao, bookmarkDao, bookmarkOrNullDao, likeDao, likeOrNullDao, mockCreatedBookmark, mockCreatedLike, mockCreatedPost, mockJustId, mockLikeDto, mockPostWithoutDetail, mockUser, postWithoutDetailOrNullDao, userDao } from '../../../data/fakeData'
import { IBookmarkRepository } from '../bookmark.repository'
import { IPostService, PostService } from '../../post/bll/post.service'
import { LikeService } from '../bll/like.service'
import { BookmarkService } from '../bll/bookmark.service'
import { IUserService } from '../../user/bll/user.service'

describe('PostActionService', () => {
    let postService: PostService
    let likeService: LikeService
    let bookmarkService: BookmarkService
    let mockPostService: jest.Mocked<IPostService>
    let mockLikeRepository: jest.Mocked<ILikeRepository>
    let mockBookmarkRepository: jest.Mocked<IBookmarkRepository>
    let mockUserService: jest.Mocked<IUserService>

    beforeEach(() => {
        mockPostService = {
            getPostWitoutDetail: jest.fn(),
        } as any
        mockLikeRepository = {
            create: jest.fn(),
            findByUserAndPost: jest.fn(),
            remove: jest.fn(),
        } as any
        mockBookmarkRepository = {
            create: jest.fn(),
            findByUserAndPost: jest.fn(),
            remove: jest.fn(),
            findAllByUser: jest.fn(),
        } as any
        mockUserService = {
            getUserById: jest.fn(),
        } as any
        bookmarkService = new BookmarkService(mockBookmarkRepository, mockPostService, mockUserService)
        likeService = new LikeService(mockLikeRepository, mockPostService, mockUserService)
    })

    it('should like a post', async () => {
        mockLikeRepository.create.mockResolvedValue(mockCreatedLike)
        mockLikeRepository.findByUserAndPost.mockResolvedValue(undefined)
        mockPostService.getPostWitoutDetail.mockResolvedValue(mockPostWithoutDetail)
        mockUserService.getUserById.mockResolvedValue(mockUser[1])
        const result = await likeService.likePost(mockLikeDto.user.id, mockJustId.id2)

        expect(result).toEqual({ msg: messages.liked.persian})
        //expect(result).toEqual(mockCreatedPost[1])
        expect(mockLikeRepository.create).toHaveBeenCalledWith(expect.objectContaining({ post: mockPostWithoutDetail, user: mockUser[1] }))
    })
    it('should unlike a post', async () => {
        mockLikeRepository.remove.mockResolvedValue(mockCreatedLike)
        mockLikeRepository.findByUserAndPost.mockResolvedValue(mockCreatedLike)
        mockPostService.getPostWitoutDetail.mockResolvedValue(mockPostWithoutDetail)
        mockUserService.getUserById.mockResolvedValue(mockUser[1])
        const result = await likeService.unlikePost(mockLikeDto.user.id, mockJustId.id2)

        expect(result).toEqual({ msg: messages.unliked.persian })
        //expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockLikeRepository.remove).toHaveBeenCalledWith(mockCreatedLike.id)
    })

    it('should bookmark a post', async () => {
        mockBookmarkRepository.create.mockResolvedValue(mockCreatedBookmark)
        mockBookmarkRepository.findByUserAndPost.mockResolvedValue(undefined)
        mockPostService.getPostWitoutDetail.mockResolvedValue(mockPostWithoutDetail)
        mockUserService.getUserById.mockResolvedValue(mockUser[1])
        const result = await bookmarkService.bookmarkPost(mockLikeDto.user.id, mockJustId.id1)

        expect(result).toEqual({ msg: messages.bookmarked.persian })
        //expect(result).toEqual(mockCreatedPost[1])
        expect(mockBookmarkRepository.create).toHaveBeenCalledWith(expect.objectContaining({ post: mockPostWithoutDetail, user: mockUser[1] }))
    })

    it('should unbookmark a post', async () => {
        mockBookmarkRepository.remove.mockResolvedValue(mockCreatedBookmark)
        mockBookmarkRepository.findByUserAndPost.mockResolvedValue(mockCreatedBookmark)
        mockPostService.getPostWitoutDetail.mockResolvedValue(mockPostWithoutDetail)
        mockUserService.getUserById.mockResolvedValue(mockUser[1])
        const result = await bookmarkService.unbookmarkPost(mockLikeDto.user.id, mockJustId.id1)

        expect(result).toEqual({ msg: messages.unbookmarked.persian })
        //expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockBookmarkRepository.remove).toHaveBeenCalledWith(mockCreatedLike.id)
    })
    it('should get myBookmarkeds list of post', async () => {
        mockBookmarkRepository.findAllByUser.mockResolvedValue([mockCreatedBookmark])
        const result = await bookmarkService.getMyBookmarkeds(mockLikeDto.user.id)

        expect(result).toEqual({ result: [mockCreatedPost[1]], total: 1 })
        //expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockBookmarkRepository.findAllByUser).toHaveBeenCalledWith(mockCreatedLike.id)
    })
})
