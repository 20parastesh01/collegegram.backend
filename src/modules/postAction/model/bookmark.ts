import { PostWithDetail } from '../../post/model/post'
import { PostId } from '../../post/model/post-id'
import { UserId } from '../../user/model/user-id'
import { BookmarkId } from './bookmark-id'

export interface BookmarkWithPost extends BasicBookmark {
    post: PostWithDetail
}
export interface BasicBookmark {
    id: BookmarkId
    postId: PostId
    userId: UserId
}
