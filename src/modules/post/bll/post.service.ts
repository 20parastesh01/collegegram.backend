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
import { IUserService } from '../../user/bll/user.service'
import { IRelationService } from '../../user/bll/relation.service'
import { User } from '../../user/model/user'
import { Relation } from '../../user/model/relation'


export type arrayResult = { result: PostWithDetail[], total: number }
export type timelineArrayResult = { result: {user: User, post:PostWithDetail}[], total: number }
export type requestedPostId = { requestedPostId: PostId | JustId }
export type requestedUserId = { requestedUserId: UserId | JustId}

export type resMessage = {
    msg: Msg,
    err: BadRequestError[] | ServerError[] | NotFoundError[],
    data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[] | requestedUserId[] | timelineArrayResult[],
    errCode?: WholeNumber,
}

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resMessage>
    getPost(id: JustId): Promise<resMessage>
    getAllPosts(userId: UserId, targetUserId: JustId): Promise<resMessage>
    getMyPosts(userId: UserId): Promise<resMessage>
    getMyTimeline(userId: UserId): Promise<resMessage>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private userService: IUserService,
        private relationService: IRelationService,
        ) {}
    
    validateAccess = (targetUser:User, relation?: Relation | undefined) => {
        return ((relation && relation.status === 'Following') || (!relation && targetUser.private === false)) 
    }

    async getAllPosts(userId: UserId, targetId: JustId) {
        const targetUserId = zodUserId.parse(targetId)
        const targetUser = (await this.userService.getUserById(targetUserId))
        if(!targetUser)
            return { msg: messages.userNotFound.persian , err : [] , data:[{requestedUserId:targetId}] }

        const relation = (await this.relationService.getRelations(userId,targetUserId)).relation
        if (!this.validateAccess(targetUser,relation)) 
            return { msg: messages.postAccessDenied.persian , err : [] , data:[{requestedUserId:targetUserId}] }
        
        const result = (await this.postRepo.findAllByAuthor(targetUserId)).toPostList()
        if (result.length < 1)
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedUserId:targetUserId}] }
        
        result.every(async (post) => (post.photos = (await MinioRepo.getPostPhotoUrl(post.id)) || []))
        return { msg: messages.succeeded.persian , err : [] , data:[ {result, total: result.length} ] }    
    }
    
    async getMyPosts(userId: UserId) {

        const result = (await this.postRepo.findAllByAuthor(userId)).toPostList()
        if (result.length < 1)
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedUserId:userId}] }

        result.every(async (post) => (post.photos = (await MinioRepo.getPostPhotoUrl(post.id)) || []))
        return { msg: messages.succeeded.persian , err : [] , data:[ {result: result, total: result.length} ] }
    }

    async getMyTimeline(userId: UserId) {

        const usersId = (await this.relationService.getFollowing(userId)).concat(userId)
        const users = (await this.userService.getUserListById(usersId))
        if (users.length < usersId.length)
            return { msg: messages.failed.persian , err : [new ServerError(PersianErrors.ServerError)] , data:[{requestedUserId:userId}] }

        const posts = (await this.postRepo.findAllByAuthorList(usersId)).toPostList()
        if (posts.length < 1)
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedUserId:userId}] }

        posts.every(async (post) => (post.photos = (await MinioRepo.getPostPhotoUrl(post.id)) || []))
        const result = posts.map( (post) => ({user: users.filter((user)=>(user.id === post.author))[0], post:post}))
        return { msg: messages.succeeded.persian , err : [] , data:[ {result: result, total: result.length} ] }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {

        const createPostRepoInput = toCreatePost({ ...dto, author: userId })
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPost()
        if (!createdPost) 
            return { msg: messages.failed.persian , err : [ new ServerError(PersianErrors.ServerError) ] , data:[{requestedUserId:userId}] }

        await MinioRepo.uploadPostPhoto(createdPost.id, files)
        createdPost.photos = await MinioRepo.getPostPhotoUrl(createdPost.id) || []
        return { msg: messages.succeeded.persian , err : [] , data:[ createdPost ] } 
    }

    async getPost(id: JustId) {

        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithDetailByID(postId)).toPost()
        if (!post)
            return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }

        post.photos = await MinioRepo.getPostPhotoUrl(post.id) || []
        return { msg: messages.succeeded.persian , err : [] , data:[post] }
    }
}
