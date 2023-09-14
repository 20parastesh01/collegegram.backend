import { Tag } from "../modules/post/model/tag"
import { Readable } from "typeorm/platform/PlatformTools"
import { CreateLike } from "../modules/post/like.repository"
import { Caption } from "../modules/post/model/caption"
import { LikeId } from "../modules/post/model/like-id"
import { BasicPost, PostWithDetail, PostWithoutDetail } from "../modules/post/model/post"
import { PostId } from "../modules/post/model/post-id"
import { Password } from "../modules/user/model/password"
import { User } from "../modules/user/model/user"
import { UserId } from "../modules/user/model/user-id"
import { Username } from "../modules/user/model/username"
import { Email } from "./email"
import { WholeNumber } from "./whole-number"
import { LikeWithPost } from "../modules/post/model/like"
import { CreatePost } from "../modules/post/post.repository"
import { JustId } from "./just-id"
import { UserEntity } from "../modules/user/entity/user.entity"

export const mockcreatePostDto = {
    tags: ['a', 'b'] as Tag[],
    caption: 'test' as Caption,
    closeFriend: false,
}
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
    postId4: 5 as PostId,
}
export const mockUserId = 123 as UserId
export const photoCount = 2 as WholeNumber
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
export const mockCreatePost : CreatePost = {
    caption: 'test' as Caption,
    tags: ['a', 'b'] as Tag[],
    
    author: mockUserId,
    closeFriend: false,
    likeCount: 0 as WholeNumber,
    commentCount: 0 as WholeNumber,
}
export const mockCreatedPost: PostWithDetail[] = [{
    id: mockPostId.postId1,
    caption: 'test' as Caption,
    tags: ['a', 'b'] as Tag[],
    author: mockUserId,
    closeFriend: false,
    likeCount: 0 as WholeNumber,
    bookmarkCount: 0 as WholeNumber,
    commentCount: 0 as WholeNumber,
},
{
    id: mockPostId.postId2,
    caption: 'test2' as Caption,
    tags: ['a', 'b'] as Tag[],
    author: mockUserId,
    closeFriend: false,
    likeCount: 2 as WholeNumber,
    bookmarkCount: 0 as WholeNumber,
    commentCount: 2 as WholeNumber,
}]
export const mockCreatedPostWithLike: PostWithDetail ={
    id: mockPostId.postId2,
    caption: 'test2' as Caption,
    tags: ['a', 'b'] as Tag[],
    author: mockUserId,
    closeFriend: false,
    likeCount: 1 as WholeNumber,
    bookmarkCount: 0 as WholeNumber,
    commentCount: 2 as WholeNumber,
}
export const CreatedPost: PostWithDetail[] = [{
    ...mockCreatedPost[0],
    photos: ["/file/post/1-1?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20230910%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230910T115835Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=c519d693cbd8d45e465aed61469dd12095ee92dbf4ae6ba905607bbed83d3a3f", "/file/post/1-2?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20230910%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230910T115835Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=fe14ba3ad4990f8b5813586215cc17b3bbfe479b46460335a2509120758a6fbc"]
},{
    id: mockPostId.postId2,
    caption: 'test2' as Caption,
    tags: ['a', 'b'] as Tag[],
    author: mockUserId,
    closeFriend: false,
    likeCount: 2 as WholeNumber,
    bookmarkCount: 0 as WholeNumber,
    commentCount: 2 as WholeNumber,
}
]

export const mockPostWithoutDetail : PostWithoutDetail = {
    id: mockPostId.postId2,
    caption: 'test2' as Caption,
    tags: ['a', 'b'] as Tag[],
    author: mockUserId,
    closeFriend: false,
}
export const mockLikeDto : CreateLike = {
    user:{id: 2 as UserId} as User,
    post:{...mockPostWithoutDetail} as PostWithoutDetail,
}
export const mockCreatedLike = {
    id: 1 as LikeId,
    userId :  2 as UserId,
    postId : mockPostId.postId2,
    post: mockCreatedPost[1]
}
export const mockUser : UserEntity = {
    id: 2 as UserId,
    username:"" as Username,
    email: "" as Email,
    name: "" as string,
    lastname: "" as string,
    followers: 0 as WholeNumber,
    following: 0 as WholeNumber,
    bio: "" as string,
    postsCount: 0 as  WholeNumber,
    private: false as boolean,
} as UserEntity
export const postWithLikeOrNullDao = (input: PostWithDetail) => {
    return {
        toPost(): PostWithDetail |undefined
        {
            return input
        },
        toThumbnail(): BasicPost | undefined{
            return undefined
        }
    }
}
export const postWithoutLikeOrNullDao = (input: PostWithoutDetail) =>{
    return{
        toPost():  undefined | PostWithoutDetail {
            return input
        },
        toThumbnail(): BasicPost | undefined {
            return undefined
        },
    }
}
export const postWithoutLikeDao = (input: PostWithDetail) => {
    return {
        toPost():PostWithDetail{
            return input
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
export const likeDao = (input: LikeWithPost) => {
    return {
        toLike(): LikeWithPost {
            return (input)
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
        }
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