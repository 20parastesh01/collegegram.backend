
import { ILikeRepository } from '../like.repository'
import { IUserRepository } from '../../user/user.repository'
import { messages } from '../../../utility/persian-messages'
import { bookmarkArrayDao, bookmarkDao, bookmarkOrNullDao, likeDao, likeOrNullDao, mockCreatedBookmark, mockCreatedLike, mockCreatedPost, mockJustId, mockLikeDto, mockPostWithoutDetail, mockUser, postWithoutDetailOrNullDao, userDao } from '../../../data/fakeData'
import { IBookmarkRepository } from '../bookmark.repository'
import { PostService } from '../../post/bll/post.service'
import { IPostRepository } from '../../post/post.repository'
import { LikeService } from '../bll/like.service'
import { BookmarkService } from '../bll/bookmark.service'




describe('PostService', () => {
    let postService: PostService
    let likeService: LikeService
    let bookmarkService: BookmarkService
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
            findAllByUser : jest.fn(),
        } as any
        mockUserRepository = {
            findById: jest.fn()
        } as any
        bookmarkService = new BookmarkService(mockPostRepository, mockBookmarkRepository, mockUserRepository)
        likeService = new LikeService(mockPostRepository, mockLikeRepository, mockUserRepository)
    })
    
    it('should like a post', async () => {
        
        mockLikeRepository.create.mockResolvedValue(likeDao(mockCreatedLike))
        mockLikeRepository.findByUserAndPost.mockResolvedValue(likeOrNullDao(null))
        mockPostRepository.findWithoutDetailByID.mockResolvedValue(postWithoutDetailOrNullDao(mockPostWithoutDetail))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser[1]))
        const result = await likeService.likePost(mockLikeDto.user.id,mockJustId.id2)

        expect(result.msg).toEqual(messages.liked.persian)
        expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockLikeRepository.create).toHaveBeenCalledWith(expect.objectContaining({post:mockPostWithoutDetail,user:mockUser[1]}))
    })
    it('should unlike a post', async () => {
        
        mockLikeRepository.remove.mockResolvedValue(likeOrNullDao(mockCreatedLike))
        mockLikeRepository.findByUserAndPost.mockResolvedValue(likeOrNullDao(mockCreatedLike))
        mockPostRepository.findWithoutDetailByID.mockResolvedValue(postWithoutDetailOrNullDao(mockPostWithoutDetail))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser[1]))
        const result = await likeService.unlikePost(mockLikeDto.user.id, mockJustId.id2)

        expect(result.msg).toEqual(messages.unliked.persian)
        expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockLikeRepository.remove).toHaveBeenCalledWith(mockCreatedLike.id)
    })

    it('should bookmark a post', async () => {
        
        mockBookmarkRepository.create.mockResolvedValue(bookmarkDao(mockCreatedBookmark))
        mockBookmarkRepository.findByUserAndPost.mockResolvedValue(bookmarkOrNullDao(null))
        mockPostRepository.findWithoutDetailByID.mockResolvedValue(postWithoutDetailOrNullDao(mockPostWithoutDetail))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser[1]))
        const result = await bookmarkService.bookmarkPost(mockLikeDto.user.id,mockJustId.id1)

        expect(result.msg).toEqual(messages.bookmarked.persian)
        expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockBookmarkRepository.create).toHaveBeenCalledWith(expect.objectContaining({post:mockPostWithoutDetail,user:mockUser[1]}))
    })

    it('should unbookmark a post', async () => {
        
        mockBookmarkRepository.remove.mockResolvedValue(bookmarkDao(mockCreatedBookmark))
        mockBookmarkRepository.findByUserAndPost.mockResolvedValue(bookmarkOrNullDao(mockCreatedBookmark))
        mockPostRepository.findWithoutDetailByID.mockResolvedValue(postWithoutDetailOrNullDao(mockPostWithoutDetail))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser[1]))
        const result = await bookmarkService.unbookmarkPost(mockLikeDto.user.id,mockJustId.id1)

        expect(result.msg).toEqual(messages.unbookmarked.persian)
        expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockBookmarkRepository.remove).toHaveBeenCalledWith(mockCreatedLike.id)
    })
    it('should get myBookmarkeds list of post', async () => {
        
        mockBookmarkRepository.findAllByUser.mockResolvedValue(bookmarkArrayDao([mockCreatedBookmark]))
        const result = await bookmarkService.getMyBookmarkeds(mockLikeDto.user.id)

        expect(result.msg).toEqual(messages.unliked.persian)
        expect(result.data[0]).toEqual(mockCreatedPost[1])
        expect(mockBookmarkRepository.findAllByUser).toHaveBeenCalledWith(mockCreatedLike.id)
    })
})
