import { WholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { Content } from './content'
import { CommentId } from './comment-id'
import { PostId } from '../../post/model/post-id'
import { ParentId } from './parent-id'

export interface Comment extends BaseComment {
    id: CommentId
    likesCount: WholeNumber
    parentId: ParentId  | null
}
export interface NewComment extends BaseComment {
    parentId: ParentId  | null
}
export interface BaseComment {
    author: UserId
    postId: PostId
    content: Content
}
