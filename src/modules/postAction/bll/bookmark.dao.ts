import { BookmarkEntity } from '../entity/bookmark.entity'
import { CreateBookmark } from '../bookmark.repository'
import { zodUserId } from '../../user/model/user-id'
import { zodBookmarkId } from '../model/bookmark-id'
import { User } from '../../user/model/user'
import { BasicBookmark , BookmarkWithPost } from '../model/bookmark'
import { zodStrictPost, PostWithoutDetail } from '../../post/model/post'
import { zodPostId } from '../../post/model/post-id'

const bookmarkEntityToBookmark = (input: BookmarkEntity) => {
    const { id, post, user } = input
    const output: BookmarkWithPost = {
        id: zodBookmarkId.parse(id),
        post: zodStrictPost.parse(post),
        userId: zodUserId.parse(user.id),
        postId: zodPostId.parse(post.id),
    }
    return output
}
const bookmarkEntityToBasicBookmark = (input: BookmarkEntity) => {
    const { id, post, user } = input
    const output: BasicBookmark = {
        id: zodBookmarkId.parse(id),
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
        toBookmarkWithDates(): BookmarkWithPost | undefined {
            if (input === null) return undefined
            else {
                return bookmarkEntityToBookmark(input)
            }
        }
    }
}
export const bookmarkDao = (input: BookmarkEntity) => {
    return {
        toBookmark(): BookmarkWithPost {
            return bookmarkEntityToBookmark(input)
        }
    }
}
export const bookmarkArrayDao = (input: BookmarkEntity[]) => {
    return {
        toBookmarkList(): BookmarkWithPost[] {
            return input.map((entity) => {
                return bookmarkEntityToBookmark(entity)
            })
        }
    }
}
export const bookmarkWithoutIdToCreateBookmarkEntity = (user: User, post: PostWithoutDetail ): CreateBookmark => {
    const createBookmarkEntity: CreateBookmark = { user: user, post: post }
    return createBookmarkEntity
}
