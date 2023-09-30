import { WholeNumber, zodWholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { Content, zodContent } from './content'
import { CommentId, zodCommentId } from './comment-id'
import { PostId, zodPostId } from '../../post/model/post-id'
import { User, UserShort, zodUserShort } from '../../user/model/user'
import { z } from 'zod'
import { PostWithDetail } from '../../post/model/post'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

export const zodComment = z.object({
    id: zodCommentId,
    content: zodContent,
    postId: zodPostId,
    author: zodUserShort,
    likeCount: zodWholeNumber,
    parentId: zodCommentId.optional(),
    createdAt: z.instanceof(Date),
    ifLiked: zodBooleanOrBooleanString.optional(),
})
export interface Comment extends BasicComment {
    likeCount: WholeNumber
    parentId?: CommentId
    createdAt: Date
    ifLiked?: boolean
}
export interface NewComment {
    author: User
    post: PostWithDetail
    content: Content
    parentId?: CommentId
}
export interface BasicComment {
    id: CommentId
    author: UserShort
    postId: PostId
    content: Content
}
