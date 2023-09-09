import { Readable } from 'stream'
import { WholeNumber } from '../../../data/whole-number'
import { UserId, zodUserId } from '../../user/model/user-id'
import { PostEntity } from '../entity/post.entity'
import { Caption, zodCaption } from '../model/caption'
import { BasePost, PostWithLikeCount } from '../model/post'
import { PostId, zodPostId } from '../model/post-id'
import { Tag, zodTags } from '../model/tag'
import { IPostRepository } from '../post.repository'
import { ILikeRepository, LikeRepository } from '../like.repository'
import { IUserRepository, UserRepository } from '../../user/user.repository'
import { PostService } from '../bll/post.service'

const mockcreatePostDto = {
    tags: ['a', 'b'] as Tag[],
    caption: 'test' as Caption,
    closeFriend: false,
}
const mockPostId = {
    postId: 1 as PostId,
    postId2: 2 as PostId,
}
const mockUserId = 123 as UserId
const photosCount = 2 as WholeNumber
const mockFiles: Express.Multer.File[] = [
    {
        fieldname: 'file1',
        originalname: 'example.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'example-1631018138245.jpg',
        path: '/uploads/example-1631018138245.jpg',
        size: 123456, // file size in bytes

        // Properties for ReadableStream and Buffer
        stream: Readable.from([]), // Empty readable stream
        buffer: Buffer.alloc(0), // Empty buffer
    },
    {
        fieldname: 'file2',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        destination: '/uploads',
        filename: 'document-1631018167352.pdf',
        path: '/uploads/document-1631018167352.pdf',
        size: 789012, // file size in bytes

        // Properties for ReadableStream and Buffer
        stream: Readable.from([]), // Empty readable stream
        buffer: Buffer.alloc(0), // Empty buffer
    },
]
const mockCreatedPost: PostWithLikeCount[] = [{
    id: mockPostId.postId,
    caption: 'test' as Caption,
    tags: ['a', 'b'] as Tag[],
    photosCount: photosCount,
    author: mockUserId,
    closeFriend: false,
    likeCount: 0 as WholeNumber,
    commentsCount: 0 as WholeNumber,
},{
    id: mockPostId.postId2,
    caption: 'test2' as Caption,
    tags: ['a', 'b'] as Tag[],
    photosCount: photosCount,
    author: mockUserId,
    closeFriend: false,
    likeCount: 2 as WholeNumber,
    commentsCount: 2 as WholeNumber,
}]
const postWithLikeOrNullDao = (input: PostWithLikeCount) => {
    return {
        toPostModel(): PostWithLikeCount |undefined
        {
            return input
        },
        toThumbnailModel(): BasePost | undefined{
            return undefined
        }
    }
}
const postWithoutLikeDao = (input: PostWithLikeCount) => {
    return {
        toPostModel():PostWithLikeCount{
            return input
        },
    }
}
const postArrayDao = (input: PostWithLikeCount[]) => {
    return {
        toPostModelList(): PostWithLikeCount[] {
            return input
        },
        toThumbnailModelList(): BasePost[] {
            return [] as BasePost[]
        },
    }
}

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
            findAllByAuthor: jest.fn(),
        } as any
        mockLikeRepository = {
            findLikeByUserAndPost: jest.fn(),
            create : jest.fn(),
        } as any

        postService = new PostService(mockPostRepository, mockLikeRepository, mockUserRepository)
    })


    it('should create a post', async () => {
        
        mockPostRepository.create.mockResolvedValue(postWithoutLikeDao(mockCreatedPost[0]))

        const result = await postService.createPost(mockcreatePostDto, mockFiles, mockUserId)

        expect(result).toEqual(mockCreatedPost[0])
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockCreatedPost))
    })

    it('should get a post', async () => {
        
        mockPostRepository.findPostWithLikeCountByID.mockResolvedValue(postWithLikeOrNullDao(mockCreatedPost[0]))
        const result = await postService.getPost(mockPostId.postId)

        expect(result).toEqual(postWithLikeOrNullDao(mockCreatedPost[0]))
        expect(mockPostRepository.findPostWithLikeCountByID).toHaveBeenCalledWith(expect.objectContaining(mockCreatedPost))
    })

    it('should get all post of user', async () => {
        
        mockPostRepository.findAllByAuthor.mockResolvedValue(postArrayDao(mockCreatedPost))
        const result = await postService.getAllPosts(mockUserId)

        expect(result).toEqual(mockCreatedPost)
        expect(mockPostRepository.findPostWithLikeCountByID).toHaveBeenCalledWith(expect.objectContaining(mockCreatedPost))
    })

    
})
