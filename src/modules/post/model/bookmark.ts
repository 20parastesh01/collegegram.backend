
import { UserId } from '../../user/model/user-id'
import { BookmarkId } from './bookmark-id'
import { PostWithDetail } from './post'
import { PostId } from './post-id'

export interface BookmarkWithPost extends BasicBookmark {
    post: PostWithDetail
}
export interface BasicBookmark {
    id:BookmarkId
    postId: PostId
    userId: UserId
}