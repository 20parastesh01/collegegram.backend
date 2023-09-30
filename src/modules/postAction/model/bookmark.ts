import { z } from 'zod'
import { PostWithDetail, zodStrictPost } from '../../post/model/post'
import { PostId, zodPostId } from '../../post/model/post-id'
import { UserId, zodUserId } from '../../user/model/user-id'
import { BookmarkId, zodBookmarkId } from './bookmark-id'

export const zodBookmarkWithPost= z.object({
    id: zodBookmarkId,
    post: zodStrictPost,
    userId: zodUserId,
    postId: zodPostId,
})

export const zodBasicBookmark= z.object({
    id: zodBookmarkId,
    userId: zodUserId,
    postId: zodPostId,
})
export interface BookmarkWithPost extends BasicBookmark {
    post: PostWithDetail
}
export interface BasicBookmark {
    id: BookmarkId
    postId: PostId
    userId: UserId
}
export interface DeletedBookmark {
    id: BookmarkId
    postId: PostId
    userId: UserId
    post: PostWithDetail
}
