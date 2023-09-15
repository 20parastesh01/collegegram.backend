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
import { IUserRepository } from '../../user/user.repository'
import { Msg, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { LikeWithPost } from '../../postAction/model/like'
import { IUserService } from '../../user/bll/user.service'
import { IRelationService } from '../../user/bll/relation.service'
import { RelationStatus } from '../../user/model/relation'

export type arrayResult = { result: PostWithDetail[], total: number }
export type requestedPostId = { requestedPostId: PostId | JustId }
export type requestedUserId = { requestedUserId: UserId | JustId}

export type resMessage = {
    msg: Msg,
    err: BadRequestError[] | ServerError[] | NotFoundError[],
    data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[] | requestedUserId[],
    errCode?: WholeNumber,
}

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<resMessage>
    getPost(id: JustId): Promise<resMessage>
    getAllPosts(userId: UserId, targetUserId: JustId): Promise<resMessage>
}

@Service(PostRepository)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private readonly userRepo: IUserRepository,
        private userService: IUserService,
        private relationService: IRelationService,
        ) {}

    async getAllPosts(userId: UserId, targetId: JustId) {
        const targetUserId = zodUserId.parse(targetId)
        const targetUser = (await this.userService.getUserById(targetUserId))
        if(targetUser){
            const relation = (await this.relationService.getRelations(userId,targetUserId)).relation
            if (targetUser.private === false || (relation && relation.status === 'Following')) {
                const result = (await this.postRepo.findAllByAuthor(targetUserId)).toPostList()
                if (result.length >= 1){
                    for (let post of result) {
                        const photos = await MinioRepo.getPostPhotoUrl(post.id)
                        if (photos) {
                            post.photos = photos
                        }
                    }
                    return { msg: messages.succeeded.persian , err : [] , data:[ {result, total: result.length} ] }
                } 
                return { msg: messages.postNotFound.persian , err : [] , data:[{requestedUserId:targetUserId}] }
            }
            return { msg: messages.postAccessDenied.persian , err : [] , data:[{requestedUserId:targetUserId}] }
        } 
        return { msg: messages.userNotFound.persian , err : [] , data:[{requestedUserId:targetId}] }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {
        const createPostRepoInput = toCreatePost({ ...dto, author: userId })
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPost()
        if (createdPost) {
            const photos = await MinioRepo.getPostPhotoUrl(createdPost.id)
            if (photos) {
                createdPost.photos = photos
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
                post.photos = photos
            }
        }
        if (post !== undefined)
            return { msg: messages.succeeded.persian , err : [] , data:[post] }
        return { msg: messages.postNotFound.persian , err : [] , data:[{requestedPostId:id}] }
    }
}
