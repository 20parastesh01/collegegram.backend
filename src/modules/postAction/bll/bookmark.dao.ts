import { BookmarkEntity } from '../entity/bookmark.entity'
import { CreateBookmark } from '../bookmark.repository'
import { zodUserId } from '../../user/model/user-id'
import { BookmarkId, zodBookmarkId } from '../model/bookmark-id'
import { User } from '../../user/model/user'
import { BasicBookmark, BookmarkWithPost, zodBasicBookmark, zodBookmarkWithPost } from '../model/bookmark'
import { PostWithDetail, zodStrictPost } from '../../post/model/post'

const toBookmarkWithPost = (input: BookmarkEntity) => {
    const { id, post, user_id,postId } = input
    const ID = id ?? (0 as BookmarkId)
    const output: BookmarkWithPost = zodBookmarkWithPost.parse({id:ID, post, postId,user_id})
    return output
}
const ToBasicBookmark = (input: BookmarkEntity) => {
    const { id, postId, user_id } = input
    const ID = id ?? (0 as BookmarkId)
    const output: BasicBookmark =  zodBasicBookmark.parse({id:ID, postId, user_id})
    return output
}
export const bookmarkOrNullDao = (input: BookmarkEntity | null) => {
    return {
        toBookmark(): BookmarkWithPost | undefined {
            if (input === null) return undefined
            else {
                return toBookmarkWithPost(input)
            }
        },
    }
}
export const bookmarkDao = (input: BookmarkEntity) => {
    return {
        toBookmark(): BookmarkWithPost {
            return toBookmarkWithPost(input)
        },
    }
}
export const bookmarkArrayDao = (input: BookmarkEntity[]) => {
    return {
        toBookmarkList(): BookmarkWithPost[] {
            return input.map((entity) => {
                return toBookmarkWithPost(entity)
            })
        },
    }
}
export const toCreateBookmark = (user: User, post: PostWithDetail): CreateBookmark => {
    const { photos, ...rest } = post
    const createBookmarkEntity: CreateBookmark = { user: user, post: rest }
    return createBookmarkEntity
}
