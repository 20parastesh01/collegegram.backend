import { BookmarkEntity } from '../entity/bookmark.entity'
import { CreateBookmark } from '../bookmark.repository'
import { zodUserId } from '../../user/model/user-id'
import { BookmarkId, zodBookmarkId } from '../model/bookmark-id'
import { User } from '../../user/model/user'
import { BasicBookmark, BookmarkWithPost } from '../model/bookmark'
import { PostWithDetail, zodStrictPost } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'

const bookmarkEntityToBookmark = (input: BookmarkEntity) => {
    const { id, post, user } = input
    console.log(input)
    const ID = id ?? (0 as BookmarkId)
    const output: BookmarkWithPost = {
        id: zodBookmarkId.parse(ID),
        post: zodStrictPost.parse(post),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
const bookmarkEntityToBasicBookmark = (input: BookmarkEntity) => {
    const { id, post, user } = input
    const ID = id ?? (0 as BookmarkId)
    const output: BasicBookmark = {
        id: zodBookmarkId.parse(ID),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
export const bookmarkOrNullDao = (input: BookmarkEntity | null) => {
    return {
        toBookmark(): BookmarkWithPost | undefined {
            if (input === null) return undefined
            else {
                return bookmarkEntityToBookmark(input)
            }
        },
    }
}
export const bookmarkDao = (input: BookmarkEntity) => {
    return {
        toBookmark(): BookmarkWithPost {
            return bookmarkEntityToBookmark(input)
        },
    }
}
export const bookmarkArrayDao = (input: BookmarkEntity[]) => {
    return {
        toBookmarkList(): BookmarkWithPost[] {
            return input.map((entity) => {
                return bookmarkEntityToBookmark(entity)
            })
        },
    }
}
export const toCreateBookmark = (user: User, post: PostWithDetail): CreateBookmark => {
    const {photos , ...rest } = post
    const createBookmarkEntity: CreateBookmark = { user: user, post: rest }
    return createBookmarkEntity
}
