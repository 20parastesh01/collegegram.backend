import { ServerError } from '../../../utility/http-error'
import { IPostRepository, PostRepository } from '../post.repository'
import { CreatePostDTO } from '../dto/createPost.dto'
import { BasicPost, PostWithDetail, PostWithoutDetail } from '../model/post'
import { zodPostId } from '../model/post-id'
import { toCreatePost } from './post.dao'
import { UserId, zodUserId } from '../../user/model/user-id'
import { Service, services } from '../../../registry/layer-decorators'
import { MinioRepo } from '../../../data-source'
import { Msg, PersianErrors, messages } from '../../../utility/persian-messages'
import { JustId } from '../../../data/just-id'
import { IUserService, UserService } from '../../user/bll/user.service'
import { IRelationService, RelationService } from '../../user/bll/relation.service'
import { User } from '../../user/model/user'
import { Relation } from '../../user/model/relation'
import { EditPostDTO } from '../dto/editPost.dto'
import { CloseFriendService, ICloseFriendService } from '../../user/bll/closefriend.service'
import { LikeService } from '../../postAction/bll/like.service'
import { BookmarkService } from '../../postAction/bll/bookmark.service'
import { WholeNumber } from '../../../data/whole-number'

export type arrayResult = { result: BasicPost[]; total: number }
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
    adjustPhoto(post: PostWithDetail): Promise<PostWithDetail>
}

@Service(PostRepository, UserService, RelationService, CloseFriendService)
export class PostService implements IPostService {
    constructor(
        private postRepo: IPostRepository,
        private userService: IUserService,
        private relationService: IRelationService,
        private closeFriendService: ICloseFriendService
    ) {}

    checkCloseFriend = async (userId: UserId, targetId: UserId): Promise<boolean[]> => {
        if (targetId == userId) return [true, false]
        const interaction = await this.closeFriendService.getCloseFriend(targetId, userId)
        return interaction ? [true, false] : [false]
    }

    validateAccess = (targetUser: User, relation?: Relation | undefined) => {
        return (relation && relation.status === 'Following') || (!relation && targetUser.private === false)
    }
    async adjustPhoto<A extends BasicPost>(post: A) {
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
        const posts = await this.postRepo.findAllBasicPosts(targetUserId, closeFriend)
        if (posts.length < 1) return { msg: messages.postNotFound.persian }

        const postsWithPhotos = await Promise.all(posts.map((post) => this.adjustPhoto(post)))
        return { result: postsWithPhotos, total: posts.length }
    }

    async getMyPosts(userId: UserId) {
        const posts = await this.postRepo.findAllBasicPosts(userId, [true, false])
        if (posts.length < 1) return { msg: messages.postNotFound.persian }

        const postsWithPhotos = await Promise.all(posts.map((post) => this.adjustPhoto(post)))
        return { result: postsWithPhotos, total: posts.length }
    }

    async getMyTimeline(userId: UserId) {
        const usersId = (await this.relationService.getFollowing(userId)).concat(userId)
        const users = await this.userService.getUserListById(usersId)
        if (users.length < usersId.length) return new ServerError(PersianErrors.ServerError)

        const posts = await Promise.all(
            users.map(async (targetUser) => {
                const closeFriend = await this.checkCloseFriend(userId, targetUser.id)
                const posts = await this.postRepo.findAllFullPosts(targetUser.id, closeFriend)
                return posts
            })
        )

        const flattenedPosts = posts.flat()
        flattenedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        const postsWithLiked = await Promise.all(
            flattenedPosts.map(async (post) => {
                const like = await (services['LikeService'] as LikeService).getLikeByUserAndPost(userId, post.id)
                const bookmark = await (services['BookmarkService'] as BookmarkService).getBookmarkByUserAndPost(userId, post.id)
                post.ifBookmarked = bookmark
                post.ifLiked = like
                return post
            })
        )

        if (postsWithLiked.length < 1) return { msg: messages.postNotFound.persian }
        const postsWithPhotos = await Promise.all(postsWithLiked.map((post) => this.adjustPhoto(post)))
        const result = postsWithPhotos.map((post) => ({ user: users.filter((user) => user.id === post.author)[0], post: post }))
        return { result: result, total: result.length }
    }

    async createPost(dto: CreatePostDTO, files: Express.Multer.File[], userId: UserId) {
        if (files.length < 1) return { msg: messages.failed.persian }
        const createPostRepoInput = toCreatePost({ ...dto, author: userId })
        const createdPost = await this.postRepo.create(createPostRepoInput)
        if (!createdPost) return new ServerError(PersianErrors.ServerError)

        await MinioRepo.uploadPostPhoto(createdPost.id, files)
        const result = await this.adjustPhoto(createdPost)
        return result
    }

    async editPost(dto: EditPostDTO, id: JustId, userId: UserId) {
        const postId = zodPostId.parse(id)
        const post = await this.postRepo.findWithoutDetailByID(postId)
        if (!post || post.author !== userId) return { msg: messages.postNotFound.persian }
        post.caption = dto.caption
        post.closeFriend = dto.closeFriend
        post.tags = dto.tags ?? []
        const editedPost = await this.postRepo.edit(post)
        if (!editedPost) return new ServerError(PersianErrors.ServerError)

        const result = await this.adjustPhoto(editedPost)
        return result
    }

    async getUserPostCount(userId: UserId, targetId: UserId) {
        const closeFriend = targetId === userId ? [true, false] : await this.checkCloseFriend(userId, targetId)
        return this.postRepo.countByAuthor(targetId, closeFriend)
    }

    async getCurrentUserPostCount(userId: UserId) {
        const closeFriend = [true, false]
        return this.postRepo.countByAuthor(userId, closeFriend)
    }

    async getPost(id: JustId, userId: UserId) {
        const postId = zodPostId.parse(id)
        const post = await this.postRepo.findWithDetailByID(postId)
        if (!post) return { msg: messages.postNotFound.persian }
        const closeFriend = await this.checkCloseFriend(userId, post.author)
        if (closeFriend[0] === false && post.closeFriend === true) return { msg: messages.postAccessDenied.persian }
        const like = await (services['LikeService'] as LikeService).getLikeByUserAndPost(userId, post.id)
        const bookmark = await (services['BookmarkService'] as BookmarkService).getBookmarkByUserAndPost(userId, post.id)
        post.ifBookmarked = bookmark
        post.ifLiked = like

        const result = await this.adjustPhoto(post)
        return this.adjustPhoto(result)
    }

    async getPostWitoutDetail(id: JustId) {
        const postId = zodPostId.parse(id)
        const post = await this.postRepo.findWithoutDetailByID(postId)
        if (!post) return { msg: messages.postNotFound.persian }

        return post
    }

    async getSomePosts(userId: UserId, closeFriend: boolean[]): Promise<BasicPost[]> {
        const posts = await this.postRepo.findSomeByAuthor(userId, 4, closeFriend)
        return posts
    }

    async explore(userId: UserId): Promise<{ user: User; posts: BasicPost[] }[]> {
        const result: { user: User; posts: BasicPost[] }[] = []
        const relatedUsers = await this.relationService.getNotExploreUsers(userId)
        const unrelatedUsers = await this.userService.getExploreUsers(userId, relatedUsers)
        for (const user of unrelatedUsers) {
            const postsNumber = await this.getUserPostCount(userId, user.id)
            if (postsNumber === 0) continue
            const closeFriend = await this.checkCloseFriend(userId, user.id)
            const posts = await this.getSomePosts(user.id, closeFriend)
            for (let post of posts) {
                const photos = await MinioRepo.getPostPhotoUrl(post.id)
                post.photos = photos
            }
            const profilePhoto = await MinioRepo.getProfileUrl(user.id)
            const followerCount = await (services['RelationService'] as RelationService).getFollowersCount(user.id)
            const followingCount = await (services['RelationService'] as RelationService).getFollowingCount(user.id)
            user.followers = followerCount as WholeNumber
            user.following = followingCount as WholeNumber
            user.photo = profilePhoto || ''
            user.postsCount = postsNumber as WholeNumber
            result.push({ user, posts })
        }
        return result
    }
}
