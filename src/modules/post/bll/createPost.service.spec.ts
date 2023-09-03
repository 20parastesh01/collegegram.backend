import { Readable } from 'stream'
import { WholeNumber } from '../../../data/whole-number'
import { UserId, zodUserId } from '../../user/model/user-id'
import { PostEntity } from '../entity/post.entity'
import { Caption, zodCaption } from '../model/caption'
import { Post } from '../model/post'
import { zodPostId } from '../model/post-id'
import { Tag, zodTags } from '../model/tag'
import { IPostRepository } from '../post.repository'
import { PostService } from './post.service'

describe('PostService', () => {
    let postService: PostService
    let mockPostRepository: jest.Mocked<IPostRepository>

    beforeEach(() => {
        mockPostRepository = {
            create: jest.fn(),
        } as any

        postService = new PostService(mockPostRepository)
    })

    it('should create a post', async () => {
        const mockcreatePostDto = {
            tags: ['tag1', 'tag2', 'tag3'] as Tag[],
            caption: 'Test caption' as Caption,
            closeFriend: false,
        }
        const userId = 123 as UserId
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

        const mockCreatedPost: Post = {
            id: zodPostId.parse(1),
            caption: mockcreatePostDto.caption,
            tags: mockcreatePostDto.tags,
            photosCount: photosCount,
            author: userId,
            closeFriend: mockcreatePostDto.closeFriend,
            likesCount: 1 as WholeNumber,
            commentsCount: 1 as WholeNumber,
        }
        const postDao = (input: Post) => {
            return {
                toPostModel(): Post {
                    return input
                },
            }
        }

        mockPostRepository.create.mockResolvedValue(postDao(mockCreatedPost))

        const result = await postService.createPost(mockcreatePostDto, mockFiles, userId)

        expect(result).toEqual(mockCreatedPost)
        expect(mockPostRepository.create).toHaveBeenCalledWith(expect.objectContaining(mockCreatedPost))
    })
})
