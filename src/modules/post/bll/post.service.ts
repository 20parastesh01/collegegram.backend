import { ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { BasicPost, PostWithDetail, PostWithoutDetail } from '../model/post'
import { zodPostId } from '../model/post-id'
import { toCreatePost } from './post.dao'
import { UserId, zodUserId } from '../../user/model/user-id'
import { Service } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { IUserService, UserService } from '../../user/bll/user.service'
import { IRelationService, RelationService } from '../../user/bll/relation.service'
import { User } from '../../user/model/user'
import { Relation } from '../../user/model/relation'
import { EditPostDTO } from '../dto/editPost.dto'
import { CloseFriendService, ICloseFriendService } from '../../user/bll/closefriend.service'

export type arrayResult = { result: PostWithDetail[]; total: number }
export type timelineArrayResult = { result: { user: User; post: PostWithDetail }[]; total: number }
type Message = { msg: Msg }
export interface IPostService {
    createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId): Promise<ServerError | PostWithDetail | Message>
    editPost(dto: EditPostDTO, id: JustId, userId: UserId): Promise<Message | ServerError | PostWithDetail>
    getPost(id: JustId, userId: UserId): Promise<Message | PostWithDetail>
    getPostWitoutDetail(id: JustId): Promise<Message | PostWithoutDetail>
    getAllPosts(userId: UserId, targetUserId: JustId): Promise<arrayResult | Message>
    getMyPosts(userId: UserId): Promise<arrayResult | Message>
    getMyTimeline(userId: UserId): Promise<timelineArrayResult | Message | ServerError>
    getSomePosts(userId: UserId, closeFriend: boolean[]): Promise<BasicPost[]>
    explore(userId: UserId): Promise<{ user: User; posts: BasicPost[] }[]>
    getUserPostCount(userId: UserId, targetId: UserId): Promise<number>
    getCurrentUserPostCount(userId: UserId, targetId: UserId): Promise<number>
}

@Service(PostRepository, UserService, RelationService, CloseFriendService)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private userService: IUserService,
        private relationService: IRelationService,
        private closeFriendService: ICloseFriendService,
    ) { }

    checkCloseFriend = async (userId: UserId, targetId: UserId): Promise<boolean[]> => {
        if (targetId == userId) return [true, false]
        const interaction = await this.closeFriendService.getCloseFriend(userId, targetId)
        return interaction ? [true, false] : [false]
    }

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
        const closeFriend = await this.checkCloseFriend(userId, targetUserId)
        const posts = (await this.postRepo.findAllByAuthor(targetUserId, closeFriend)).toPostList()
        if (posts.length < 1) return { msg: messages.postNotFound.persian }

        const postsWithPhotos = await Promise.all(posts.map((post) => (this.adjustPhoto(post))))
        return { result: postsWithPhotos, total: posts.length }
    }

    async getMyPosts(userId: UserId) {
        const posts = (await this.postRepo.findAllByAuthor(userId, [true, false])).toPostList()
        if (posts.length < 1) return { msg: messages.postNotFound.persian }

        const postsWithPhotos = await Promise.all(posts.map((post) => (this.adjustPhoto(post))))
        return { result: postsWithPhotos, total: posts.length }
    }

    async getMyTimeline(userId: UserId) {
        const usersId = (await this.relationService.getFollowing(userId)).concat(userId)
        const users = await this.userService.getUserListById(usersId)
        if (users.length < usersId.length) return new ServerError(PersianErrors.ServerError)

        const posts = await Promise.all(users.map(async (targetUser) => {
            const closeFriend = await (this.checkCloseFriend(userId, targetUser.id))
            return (await this.postRepo.findAllByAuthor(targetUser.id, closeFriend)).toPostList()
        }))

        const flattenedPosts = posts.flat();
        flattenedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (flattenedPosts.length < 1) return { msg: messages.postNotFound.persian }
        const postsWithPhotos = await Promise.all(flattenedPosts.map((post) => (this.adjustPhoto(post))))
        const result = postsWithPhotos.map((post) => ({ user: users.filter((user) => user.id === post.author)[0], post: post }))
        return { result: result, total: result.length }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {
        if (files.length < 1) return { msg: messages.failed.persian }
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

    async getUserPostCount(userId: UserId, targetId: UserId) {
        const closeFriend = (targetId === userId)? [true,false] : await this.checkCloseFriend(userId, targetId)
        return this.postRepo.countByAuthor(targetId, closeFriend)
    }

    async getCurrentUserPostCount(userId: UserId) {
        const closeFriend = [true,false]
        return this.postRepo.countByAuthor(userId, closeFriend)
    }

    async getPost(id: JustId, userId: UserId) {
        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithDetailByID(postId)).toPost()
        if (!post) return { msg: messages.postNotFound.persian }
        const closeFriend = await this.checkCloseFriend(userId, post.author)
        if(closeFriend[0] === false && post.closeFriend === true )
        return { msg: messages.postAccessDenied.persian }
        const result = await this.adjustPhoto(post)
        return this.adjustPhoto(result)
    }

    async getPostWitoutDetail(id: JustId) {
        const postId = zodPostId.parse(id)
        const post = (await this.postRepo.findWithoutDetailByID(postId)).toPost()
        if (!post) return { msg: messages.postNotFound.persian }

        return post
    }

    async getSomePosts(userId: UserId, closeFriend: boolean[]): Promise<BasicPost[]> {
        const postsDao = await this.postRepo.findSomeByAuthor(userId, 4, closeFriend)
        const posts = postsDao.toThumbnailList()
        return posts
    }

    async explore(userId: UserId): Promise<{ user: User; posts: BasicPost[] }[]> {
        const result: { user: User; posts: BasicPost[] }[] = []
        const relatedUsers = await this.relationService.getRealtedUsers(userId)
        const unrelatedUsers = await this.userService.getUnrelatedUsers(userId, relatedUsers)
        for (const user of unrelatedUsers) {
            const closeFriend = await this.checkCloseFriend(userId, user.id)
            const posts = await this.getSomePosts(user.id, closeFriend)
            result.push({ user, posts })
        }
        return result
    }
}
