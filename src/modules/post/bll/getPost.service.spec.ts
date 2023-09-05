import { Readable } from 'stream'
import { WholeNumber } from '../../../data/whole-number'
import { UserId, zodUserId } from '../../user/model/user-id'
import { PostEntity } from '../entity/post.entity'
import { Caption, zodCaption } from '../model/caption'
import { Post } from '../model/post'
import { PostId, zodPostId } from '../model/post-id'
import { Tag, zodTags } from '../model/tag'
import { IPostRepository } from '../post.repository'
import { PostService } from './post.service'

describe('PostService', () => {
    let postService: PostService
    let mockPostRepository: jest.Mocked<IPostRepository>

    beforeEach(() => {
        mockPostRepository = {
            findByID: jest.fn(),
        } as any

        postService = new PostService(mockPostRepository)
    })

    it('should create a post', async () => {
        const mockGetPostDto = {
            postId: 1 as PostId,
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
            id: mockGetPostDto.postId,
            caption: 'test' as Caption,
            tags: ['a', 'b'] as Tag[],
            photosCount: photosCount,
            author: userId,
            closeFriend: false,
            likesCount: 0 as WholeNumber,
            commentsCount: 0 as WholeNumber,
        }
        const postOrNullDao = (input: Post) => {
            return {
                toPostModel(): Post {
                    return input
                },
            }
        }

        mockPostRepository.create.mockResolvedValue(postOrNullDao(mockCreatedPost))

        const result = await postService.getPost(mockGetPostDto.postId)

        expect(result).toEqual(mockCreatedPost)
        expect(mockPostRepository.findByID).toHaveBeenCalledWith(expect.objectContaining(mockCreatedPost))
    })
})
