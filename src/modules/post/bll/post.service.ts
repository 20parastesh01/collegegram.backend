import { BadRequestError, NotFoundError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { PostWithDetail, PostWithoutDetail } from '../model/post'
import { PostId, zodPostId } from '../model/post-id'
import { toCreatePost } from './post.dao'
import { UserId, zodUserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { WholeNumber } from '../../../data/whole-number'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { LikeWithPost } from '../../postAction/model/like'
import { IUserService, UserService } from '../../user/bll/user.service'
import { IRelationService, RelationService } from '../../user/bll/relation.service'
import { User } from '../../user/model/user'
import { Relation } from '../../user/model/relation'


export type arrayResult = { result: PostWithDetail[], total: number }
export type timelineArrayResult = { result: {user: User, post:PostWithDetail}[], total: number }
// export type requestedPostId = { requestedPostId: PostId | JustId }
// export type requestedUserId = { requestedUserId: UserId | JustId}
type Message = {msg: Msg }
export type resMessage = Message | PostWithDetail | PostWithoutDetail | LikeWithPost | arrayResult | timelineArrayResult | BadRequestError | ServerError
// {
//     msg: Msg,
//     err: BadRequestError[] | ServerError[] | NotFoundError[],
//     data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[] | requestedUserId[] | timelineArrayResult[],
//     errCode?: WholeNumber,
//}

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<ServerError|PostWithDetail>
    getPost(id: JustId): Promise<Message|PostWithDetail>
    getPostWitoutDetail(id: JustId): Promise<Message|PostWithoutDetail>
    getAllPosts(userId: UserId, targetUserId: JustId): Promise<resMessage>
    getMyPosts(userId: UserId): Promise<resMessage>
    getMyTimeline(userId: UserId): Promise<resMessage>
}

@Service(PostRepository, UserService, RelationService)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private userService: IUserService,
        private relationService: IRelationService,
        ) {}
    
    validateAccess = (targetUser:User, relation?: Relation | undefined) => {
        return ((relation && relation.status === 'Following') || (!relation && targetUser.private === false)) 
    }
    adjustPhoto = async (post: PostWithDetail) => {
        const postPhotos = await MinioRepo.getPostPhotoUrl(post.id)
        return post.photos = postPhotos || []
    }

    async getAllPosts(userId: UserId, targetId: JustId) {
        const targetUserId = zodUserId.parse(targetId)
        const targetUser = (await this.userService.getUserById(targetUserId))
        if(!targetUser)
            return { msg: messages.userNotFound.persian }

        const relation = (await this.relationService.getRelations(userId,targetUserId)).relation
        if (!this.validateAccess(targetUser,relation)) 
            return { msg: messages.postAccessDenied.persian }
        
        const posts = (await this.postRepo.findAllByAuthor(targetUserId)).toPostList()
        if (posts.length < 1)
            return { msg: messages.postNotFound.persian }
        
        posts.forEach((post) => (this.adjustPhoto(post)));
        return { result: posts, total: posts.length}    
    }
    
    async getMyPosts(userId: UserId) {

        const posts = (await this.postRepo.findAllByAuthor(userId)).toPostList()
        if (posts.length < 1)
            return { msg: messages.postNotFound.persian }

        posts.forEach((post) => (this.adjustPhoto(post)));
        return { result: posts, total: posts.length }
    }

    async getMyTimeline(userId: UserId) {

        const usersId = (await this.relationService.getFollowing(userId)).concat(userId)
        const users = (await this.userService.getUserListById(usersId))
        if (users.length < usersId.length)
            return new ServerError(PersianErrors.ServerError)

        const posts = (await this.postRepo.findAllByAuthorList(usersId)).toPostList()
        if (posts.length < 1)
            return { msg: messages.postNotFound.persian }
        posts.forEach((post) => (this.adjustPhoto(post)));
        //posts.map(async (post) => (post.photos = (await MinioRepo.getPostPhotoUrl(post.id)) || []))
        const result = posts.map( (post) => ({user: users.filter((user)=>(user.id === post.author))[0], post:post}))
        return { result: result, total: result.length }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {

        const createPostRepoInput = toCreatePost({ ...dto, author: userId })
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPost()
        if (!createdPost) 
            return new ServerError(PersianErrors.ServerError)

        return this.adjustPhoto(createdPost) 
    }

    async getPost(id: JustId) {

        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithDetailByID(postId)).toPost()
        if (!post)
            return { msg: messages.postNotFound.persian }

        return this.adjustPhoto(post)
    }
    async getPostWitoutDetail(id: JustId) {

        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
        if (!post)
            return { msg: messages.postNotFound.persian }

        return post
    }
}
