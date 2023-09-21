import { BadRequestError, ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { PostWithDetail, PostWithoutDetail } from '../model/post'
import { zodPostId } from '../model/post-id'
import { toCreatePost } from './post.dao'
import { UserId, zodUserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { LikeWithPost } from '../../postAction/model/like'
import { IUserService, UserService } from '../../user/bll/user.service'
import { IRelationService, RelationService } from '../../user/bll/relation.service'
import { User } from '../../user/model/user'
import { Relation } from '../../user/model/relation'
import { EditPostDTO } from '../dto/editPost.dto'

export type arrayResult = { result: PostWithDetail[]; total: number }
export type timelineArrayResult = { result: { user: User; post: PostWithDetail }[]; total: number }
// export type requestedPostId = { requestedPostId: PostId | JustId }
// export type requestedUserId = { requestedUserId: UserId | JustId}
type Message = { msg: Msg }
export type resMessage = Message | PostWithDetail | PostWithoutDetail | LikeWithPost | arrayResult | timelineArrayResult | BadRequestError | ServerError
// {
//     msg: Msg,
//     err: BadRequestError[] | ServerError[] | NotFoundError[],
//     data: PostWithDetail[] | PostWithoutDetail[] | LikeWithPost[]| arrayResult[]| requestedPostId[] | requestedUserId[] | timelineArrayResult[],
//     errCode?: WholeNumber,
//}

export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<ServerError | PostWithDetail>
    editPost(dto: EditPostDTO, id: JustId, userId: UserId): Promise<Message | ServerError | PostWithDetail>
    getPost(id: JustId): Promise<Message | PostWithDetail>
    getPostWitoutDetail(id: JustId): Promise<Message | PostWithoutDetail>
    getAllPosts(userId: UserId, targetUserId: JustId): Promise<arrayResult | Message>
    getMyPosts(userId: UserId): Promise<arrayResult | Message>
    getMyTimeline(userId: UserId): Promise<timelineArrayResult | Message | ServerError>
}

@Service(PostRepository, UserService, RelationService)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private userService: IUserService,
        private relationService: IRelationService
    ) {}

    validateAccess = (targetUser: User, relation?: Relation | undefined) => {
        return (relation && relation.status === 'Following') || (!relation && targetUser.private === false)
    }
    adjustPhoto = async (post: PostWithDetail) => {
        const postPhotos = await MinioRepo.getPostPhotoUrl(post.id)
        post.photos = postPhotos || []
        return post
    }

    async getAllPosts(userId: UserId, targetId: JustId) {
        const targetUserId = zodUserId.parse(targetId)
        const targetUser = await this.userService.getUserById(targetUserId)
        if (!targetUser) return { msg: messages.userNotFound.persian }

        const relation = (await this.relationService.getRelations(userId, targetUserId)).relation
        if (!this.validateAccess(targetUser, relation)) return { msg: messages.postAccessDenied.persian }

        const posts = (await this.postRepo.findAllByAuthor(targetUserId)).toPostList()
        if (posts.length < 1) return { msg: messages.postNotFound.persian }

        for (let post of posts) {
            await this.adjustPhoto(post)
        }
        return { result: posts, total: posts.length }
    }

    async getMyPosts(userId: UserId) {
        
        const posts = (await this.postRepo.findAllByAuthor(userId)).toPostList()
        if (posts.length < 1) return { msg: messages.postNotFound.persian }

        for (let post of posts) {
            await this.adjustPhoto(post)
        }
        return { result: posts, total: posts.length }
    }

    async getMyTimeline(userId: UserId) {
        console.log('getMyTimeline')
        const usersId = (await this.relationService.getFollowing(userId)).concat(userId)
        const users = await this.userService.getUserListById(usersId)
        console.log(users)
        if (users.length < usersId.length) return new ServerError(PersianErrors.ServerError)

        const posts = (await this.postRepo.findAllByAuthorList(usersId)).toPostList()
        if (posts.length < 1) return { msg: messages.postNotFound.persian }
        for (let post of posts) {
            await this.adjustPhoto(post)
        }
        const result = posts.map((post) => ({ user: users.filter((user) => user.id === post.author)[0], post: post }))
        return { result: result, total: result.length }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {
        const createPostRepoInput = toCreatePost({ ...dto, author: userId })
        const createdPost = (await this.postRepo.create(createPostRepoInput)).toPost()
        if (!createdPost) return new ServerError(PersianErrors.ServerError)

        await MinioRepo.uploadPostPhoto(createdPost.id, files)
        const result = await this.adjustPhoto(createdPost)
        return result
    }

    async editPost(dto: EditPostDTO, id: JustId, userId: UserId) {
        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
        if (!post || post.author !== userId) return { msg: messages.postNotFound.persian }
        post.caption = dto.caption
        post.closeFriend = dto.closeFriend
        post.tags = dto.tags ?? []
        const editedPost = (await this.postRepo.edit(post)).toPost()
        if (!editedPost) return new ServerError(PersianErrors.ServerError)

        const result = await this.adjustPhoto(editedPost)
        return result
    }

    async getPost(id: JustId) {
        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithDetailByID(postId)).toPost()
        if (!post) return { msg: messages.postNotFound.persian }

        const result = await this.adjustPhoto(post)
        return this.adjustPhoto(result)
    }
    async getPostWitoutDetail(id: JustId) {
        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
        if (!post) return { msg: messages.postNotFound.persian }

        return post
    }
}
