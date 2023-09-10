import { Readable } from 'stream'
import { WholeNumber } from '../../../data/whole-number'
import { UserId, zodUserId } from '../../user/model/user-id'
import { PostEntity } from '../entity/post.entity'
import { Caption, zodCaption } from '../model/caption'
import { BasePost, PostWithLikeCount, PostWithoutLikeCount } from '../model/post'
import { PostId, zodPostId } from '../model/post-id'
import { Tag, zodTags } from '../model/tag'
import { IPostRepository } from '../post.repository'
import { CreateLike, ILikeRepository, LikeRepository } from '../like.repository'
import { IUserRepository, UserRepository } from '../../user/user.repository'
import { PostService } from '../bll/post.service'
import { RedisRepo } from '../../../data-source'
import { Hashed } from '../../../data/hashed'
import { IRedis } from '../../../redis'
import { LikeEntity } from '../entity/like.entity'
import { LikeWithId } from '../model/like'
import { LikeId } from '../model/like-id'
import { User } from '../../user/model/user'
import { Email } from '../../../data/email'
import { Username } from '../../user/model/username'
import { Password } from '../../user/model/password'


const mockcreatePostDto = {
    tags: ['a', 'b'] as Tag[],
    caption: 'test' as Caption,
    closeFriend: false,
}
const mockPostId = {
    postId: 1 as PostId,
    postId2: 2 as PostId,
    postId3: 3 as PostId,
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
const mockPostWithoutLikeCount : PostWithoutLikeCount = {
    id: mockPostId.postId3,
    caption: 'test' as Caption,
    tags: ['a', 'b'] as Tag[],
    photosCount: photosCount,
    author: mockUserId,
    closeFriend: false,
    commentsCount: 0 as WholeNumber,
}
const mockLikeDto : CreateLike = {
    user:{id: 2 as UserId} as User,
    post:{...mockPostWithoutLikeCount} as PostWithoutLikeCount,
}
const mockCreatedLike = {
    id: 1 as LikeId,
    userId :  2 as UserId,
    postId : mockPostId.postId3,
}
const mockUser : User = {
    id: 2 as UserId,
    username:"" as Username,
    email: "" as Email,
    name: "" as string,
    lastname: "" as string,
    photo: "" as string,
    followers: 0 as WholeNumber,
    following: 0 as WholeNumber,
    bio: "" as string,
    postsCount: 0 as  WholeNumber,
    private: false as boolean,
}
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
const postWithoutLikeOrNullDao = (input: PostWithoutLikeCount) =>{
    return{
        toPostModel():  undefined | PostWithoutLikeCount {
            return input
        },
        toThumbnailModel(): BasePost | undefined {
            return undefined
        },
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
const likeDao = (input: LikeWithId) => {
    return {
        toLikeModel(): LikeWithId {
            return (input)
        },
    }
}
export const likeOrNullDao = (input: LikeWithId | null) => {
    return {
        toLikeModel(): LikeWithId | undefined {
            if (input === null) return undefined
            else {
                return input
            }
        },
        toLikeWithDatesModel(): LikeWithId | undefined {
            if (input === null) return undefined
            else {
                return input
            }
        }
    }
}
export const userDao = (input: User) => {
    if (!input) return null
    return {
        toUser(): User {
            return { ...input, photo: '' }
        },
        toUserBasic() {
            const { id: userId, username, name, lastname } = input
            return { userId, username, name, lastname }
        },
        toUserWithPassword() {
            const { ...rest } = input
            return {...rest, password : "" as Password}
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
            findPostWithoutLikeCountByID: jest.fn(),
            findAllByAuthor: jest.fn(),
        } as any
        mockLikeRepository = {
            findLikeByUserAndPost: jest.fn(),
            create : jest.fn(),
            removeLike : jest.fn(),
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

    it('should like a post', async () => {
        
        mockLikeRepository.create.mockResolvedValue(likeDao(mockCreatedLike))
        mockLikeRepository.findByUserAndPost.mockResolvedValue(likeOrNullDao(null))
        mockPostRepository.findPostWithoutLikeCountByID.mockResolvedValue(postWithoutLikeOrNullDao(mockPostWithoutLikeCount))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser))
        const result = await postService.likePost(mockLikeDto.user.id,mockLikeDto.post.id)

        expect(result).toEqual(likeDao(mockCreatedLike).toLikeModel())
        expect(mockLikeRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockCreatedLike))
    })
    it('should like a post', async () => {
        
        mockLikeRepository.removeLike.mockResolvedValue(likeOrNullDao(mockCreatedLike))
        mockLikeRepository.findByUserAndPost.mockResolvedValue(likeOrNullDao(mockCreatedLike))
        mockPostRepository.findPostWithoutLikeCountByID.mockResolvedValue(postWithoutLikeOrNullDao(mockPostWithoutLikeCount))
        mockUserRepository.findById.mockResolvedValue(userDao(mockUser))
        const result = await postService.unlikePost(mockLikeDto.user.id,mockLikeDto.post.id)

        expect(result).toEqual(likeDao(mockCreatedLike).toLikeModel())
        expect(mockLikeRepository.removeLike).toHaveBeenCalledWith(expect.objectContaining(mockCreatedLike.id))
    })


})
