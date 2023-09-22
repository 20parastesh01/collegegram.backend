import { Tag } from '../modules/post/model/tag'
import { Readable } from 'typeorm/platform/PlatformTools'
import { Caption } from '../modules/post/model/caption'
import { BasicPost, PostWithDetail, PostWithoutDetail } from '../modules/post/model/post'
import { PostId } from '../modules/post/model/post-id'
import { User, UserBasic, UserShort, UserWithPassword } from '../modules/user/model/user'
import { UserId } from '../modules/user/model/user-id'
import { Username } from '../modules/user/model/username'
import { Email } from './email'
import { WholeNumber } from './whole-number'
import { CreatePost } from '../modules/post/post.repository'
import { JustId } from './just-id'
import { CreateLike } from '../modules/postAction/like.repository'
import { LikeWithPost } from '../modules/postAction/model/like'
import { LikeId } from '../modules/postAction/model/like-id'
import { BookmarkId } from '../modules/postAction/model/bookmark-id'
import { BookmarkWithPost } from '../modules/postAction/model/bookmark'
import { Password } from '../modules/user/model/password'
import { Relation, RelationStatus } from '../modules/user/model/relation'

export const mockJustId = {
    id1: 1 as JustId,
    id2: 2 as JustId,
    id3: 3 as JustId,
    id4: 5 as JustId,
}
export const mockPostId = {
    postId1: 1 as PostId,
    postId2: 2 as PostId,
    postId3: 3 as PostId,
    postId4: 4 as PostId,
}
export const mockUserId = {
    userId1: 1 as UserId,
    userId2: 2 as UserId,
    userId3: 3 as UserId,
    userId4: 4 as UserId,
}
export const mockUser: User[] = [
    {
        id: mockUserId.userId1,
        username: '' as Username,
        email: '' as Email,
        name: '' as string,
        lastname: '' as string,
        followers: 0 as WholeNumber,
        following: 0 as WholeNumber,
        bio: '' as string,
        photo: '' as string,
        postsCount: 0 as WholeNumber,
        private: false as boolean,
    },
    {
        id: mockUserId.userId2,
        username: '' as Username,
        email: '' as Email,
        name: '' as string,
        lastname: '' as string,
        followers: 0 as WholeNumber,
        following: 0 as WholeNumber,
        bio: '' as string,
        photo: '' as string,
        postsCount: 1 as WholeNumber,
        private: false as boolean,
    },
] as User[]

export const mockCreatePostDTO = {
    tags: ['a', 'b'] as Tag[],
    caption: 'test' as Caption,
    closeFriend: false,
}
export const mockEditPostDTO = {
    tags: ['c', 'x'] as Tag[],
    caption: 'edited' as Caption,
    closeFriend: true,
}
export const mockFiles: Express.Multer.File[] = [
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
export const mockCreatePost: CreatePost = {
    caption: 'test' as Caption,
    tags: ['a', 'b'] as Tag[],

    author: mockUserId.userId1,
    closeFriend: false,
}

export const mockCreatedPost: PostWithDetail[] = [
    {
        id: mockPostId.postId1,
        caption: 'test' as Caption,
        tags: ['a', 'b'] as Tag[],
        author: mockUserId.userId1,
        closeFriend: false,
        likeCount: 0 as WholeNumber,
        bookmarkCount: 0 as WholeNumber,
        commentCount: 0 as WholeNumber,
    },
    {
        id: mockPostId.postId2,
        caption: 'test2' as Caption,
        tags: ['a', 'b'] as Tag[],
        author: mockUserId.userId1,
        closeFriend: false,
        likeCount: 1 as WholeNumber,
        bookmarkCount: 1 as WholeNumber,
        commentCount: 1 as WholeNumber,
    },
]
export const mockEditedPost = {
    id: mockPostId.postId1,
    caption: 'Edited' as Caption,
    tags: ['c', 'x'] as Tag[],
    author: mockUserId.userId1,
    closeFriend: true,
    likeCount: 1 as WholeNumber,
    bookmarkCount: 1 as WholeNumber,
    commentCount: 1 as WholeNumber,
}

export const mockPostWithoutDetail: PostWithoutDetail = {
    id: mockPostId.postId2,
    caption: 'test2' as Caption,
    tags: ['a', 'b'] as Tag[],
    author: mockUserId.userId1,
    closeFriend: false,
}

export const mockLikeDto: CreateLike = {
    user: { id: mockUserId.userId2 } as User,
    post: { ...mockCreatedPost[0] } as PostWithDetail,
}

export const mockCreatedLike = {
    id: 1 as LikeId,
    userId: 2 as UserId,
    postId: mockPostId.postId1,
    post: mockCreatedPost[1],
}
export const mockCreatedBookmark = {
    id: 1 as BookmarkId,
    userId: 2 as UserId,
    postId: mockPostId.postId2,
    post: mockCreatedPost[1],
}
export const mockRelation = {
    userA: mockUserId.userId2,
    userB: mockUserId.userId1,
    status: 'Following' as RelationStatus,
}

export const postWithDetailOrNullDao = (input: PostWithDetail) => {
    return {
        toPost(): PostWithDetail | undefined {
            return input
        },
        toThumbnail(): BasicPost | undefined {
            return undefined
        },
    }
}
export const postWithoutDetailOrNullDao = (input: PostWithoutDetail) => {
    return {
        toPost(): undefined | PostWithoutDetail {
            return input
        },
        toThumbnail(): BasicPost | undefined {
            return undefined
        },
    }
}
export const postWithDetailDao = (input: PostWithDetail) => {
    return {
        toPost(): PostWithDetail {
            return input
        },
    }
}
export const postWithoutDetailDao = (input: PostWithDetail) => {
    return {
        toPost(): PostWithDetail {
            return input
        },
        toPostWithoutDetail(): PostWithoutDetail {
            const { likeCount, bookmarkCount, commentCount, ...rest } = input
            return rest
        },
    }
}
export const postArrayDao = (input: PostWithDetail[]) => {
    return {
        toPostList(): PostWithDetail[] {
            return input
        },
        toThumbnailList(): BasicPost[] {
            return [] as BasicPost[]
        },
    }
}
export const likeDao = (input: any) => {
    return {
        toLike(): LikeWithPost {
            return input
        },
    }
}
export const likeOrNullDao = (input: LikeWithPost | null) => {
    return {
        toLike(): LikeWithPost | undefined {
            if (input === null) return undefined
            else {
                return input
            }
        },
        toLikeWithDates(): LikeWithPost | undefined {
            if (input === null) return undefined
            else {
                return input
            }
        },
    }
}
export const bookmarkDao = (input: BookmarkWithPost) => {
    return {
        toBookmark(): BookmarkWithPost {
            return input
        },
    }
}
export const bookmarkOrNullDao = (input: BookmarkWithPost | null) => {
    return {
        toBookmark(): BookmarkWithPost | undefined {
            if (input === null) return undefined
            else {
                return input
            }
        },
    }
}
export const bookmarkArrayDao = (input: BookmarkWithPost[]) => {
    return {
        toBookmarkList(): BookmarkWithPost[] {
            return input
        },
    }
}

export const userDao = (input: User | null) => {
    if (!input) return null
    return {
        toUser(): User {
            const { ...rest } = input
            return { ...rest, photo: '' }
        },
        toUserBasic(): UserBasic {
            const { id: userId, username, name, lastname } = input
            return { userId, username, name, lastname }
        },
        toUserWithPassword(): UserWithPassword {
            const { ...rest } = input
            return { ...rest, photo: '', password: '' as Password }
        },
        toUserShort(): UserShort {
            const { id, username, name, lastname } = input
            return { id, username, name, lastname, photo: '' }
        },
    }
}
export const relationDao = (input: Relation | null) => {
    if (!input) return null
    return {
        toRelation(): Relation {
            return input
        },
    }
}

// export const userDao = (input: UserEntity) => {
//     if (!input) return null
//     return {
//         toUser(): User {
//             return { ...input, photo: '' }
//         },
//         toUserBasic() {
//             const { id: userId, username, name, lastname } = input
//             return { userId, username, name, lastname }
//         },
//         toUserWithPassword() {
//             const { ...rest } = input
//             return {...rest, password : "" as Password}
//         },
//     }
// }
