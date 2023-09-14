import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { PostWithDetail, PostWithoutDetail } from '../model/post'
import { zodPostId } from '../model/post-id'
import { newPostToRepoInput } from './post.dao'
import { UserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { WholeNumber, zodWholeNumber } from '../../../data/whole-number'
import { ILikeRepository } from '../like.repository'
import { IUserRepository } from '../../user/user.repository'
import { likeWithoutIdToCreateLikeEntity } from './like.dao'
import { LikeWithPost } from '../model/like'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { IBookmarkRepository } from '../bookmark.repository'
import { bookmarkWithoutIdToCreateBookmarkEntity } from './bookmark.dao'
  
type arrayResult = { result: PostWithDetail[], total: number }
export type requestedPostId = { requestedPostId: JustId }

export type resMessage = {
    msg: Msg,
    err: BadRequestError[] | ServerError[] | NotFoundError[],
    data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[],
    errCode?: WholeNumber,
}

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resMessage>
    getPost(id: JustId): Promise<resMessage>
    getAllPosts(userId: UserId): Promise<resMessage>
    likePost(userId: UserId,id: JustId): Promise<resMessage>
    unlikePost(userId: UserId,id: JustId): Promise<resMessage>
    bookmarkPost(userId: UserId,id: JustId): Promise<resMessage>
    unbookmarkPost(userId: UserId,id: JustId): Promise<resMessage>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private likeRepo: ILikeRepository,
        private bookmarkRepo: IBookmarkRepository,
        private readonly userRepo: IUserRepository
        ) {}
    
    async likePost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId)).toLike();
        if (!like) {
            const user = (await this.userRepo.findById(userId))?.toUser()
            const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
            if(user && post) {
                const input = likeWithoutIdToCreateLikeEntity(user, post)
                const createdLike = (await this.likeRepo.create(input)).toLike()
                const updatedPost = createdLike.post;
                if(createdLike !== undefined) return { msg: messages.liked.persian , err : [] , data:[updatedPost] }
                return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
            }
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }
        }
        return { msg: messages.notLikedYet.persian , err : [] , data:[{requestedPostId:id}] }
    }
    async unlikePost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const like = (await this.likeRepo.findByUserAndPost(userId, postId)).toLike();
        if (!like) {
            return { msg: messages.notLikedYet.persian , err : [] , data:[{requestedPostId:id}] }
        }
        const createdLike = (await this.likeRepo.remove(like.id)).toLike()
        if( createdLike !== undefined){
            const updatedPost = createdLike.post; 
            return  { msg: messages.unliked.persian , err : [] , data:[updatedPost] }
        }
        return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
    }
    async bookmarkPost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark();
        if (!bookmark) {
            const user = (await this.userRepo.findById(userId))?.toUser()
            const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
            if(user && post) {
                const input = bookmarkWithoutIdToCreateBookmarkEntity(user, post)
                const createdBookmark = (await this.bookmarkRepo.create(input)).toBookmark()
                const updatedPost = createdBookmark.post;
                if(createdBookmark !== undefined) return { msg: messages.bookmarked.persian , err : [] , data:[updatedPost] }
                return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
            }
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }
        }
        return { msg: messages.notBookmarkedYet.persian , err : [] , data:[{requestedPostId:id}] }
    }
    async unbookmarkPost(userId: UserId, id: JustId) {
        const postId = zodPostId.parse(id)
        const bookmark = (await this.bookmarkRepo.findByUserAndPost(userId, postId)).toBookmark();
        if (!bookmark) {
            return { msg: messages.notBookmarkedYet.persian , err : [] , data:[{requestedPostId:id}] }
        }
        const createdBookmark = (await this.bookmarkRepo.remove(bookmark.id)).toBookmark()
        if( createdBookmark !== undefined){
            const updatedPost = createdBookmark.post; 
            return  { msg: messages.unbookmarked.persian , err : [] , data:[updatedPost] }
        }
        return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[] }
    }

    async getAllPosts(userId: UserId) {
        const result = (await this.postRepo.findAllByAuthor(userId)).toPostList()
        for (let post of result) {
            const photos = await MinioRepo.getPostPhotoUrl(post.id)
            if (photos) {
                post.photos = await MinioRepo.getPostPhotoUrl(post.id)
            }
        }
        return { msg: messages.succeeded.persian , err : [] , data:[ {result, total: result.length} ] }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {
        const createPostRepoInput = newPostToRepoInput({ ...dto, author: userId })
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPost()
        if (createdPost) {
            const photos = await MinioRepo.getPostPhotoUrl(createdPost.id)
            if (photos) {
                createdPost.photos = await MinioRepo.getPostPhotoUrl(createdPost.id)
            }
            await MinioRepo.uploadPostPhoto(createdPost.id, files)
        }

        return { msg: messages.succeeded.persian , err : [] , data:[ createdPost ] } 
    }

    async getPost(id: JustId) {
        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithDetailByID(postId)).toPost()
        if (post) {
            const photos = await MinioRepo.getPostPhotoUrl(post.id)
            if (photos) {
                post.photos = await MinioRepo.getPostPhotoUrl(post.id)
            }
        }
        if (post !== undefined)
            return { msg: messages.succeeded.persian , err : [] , data:[post] }
        return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }
    }
}
