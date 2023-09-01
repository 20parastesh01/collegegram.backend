import { WholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { Content } from './content'
import { CommentId } from './comment-id'
import { PostId } from '../../post/model/post-id'

export interface Comment extends baseComment {
    id: CommentId
    likesCount: WholeNumber
    parentId?: CommentId | null
}
export interface newComment extends baseComment {
    parentId?: CommentId | null
}
export interface baseComment {
    author: UserId
    postId: PostId
    content: Content
}
