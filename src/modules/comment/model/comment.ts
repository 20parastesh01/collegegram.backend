import { WholeNumber, zodWholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { Content } from './content'
import { CommentId, zodCommentId } from './comment-id'
import { PostId, zodPostId } from '../../post/model/post-id'
import { User, UserShort, zodUserShort } from '../../user/model/user'
import { z } from 'zod'
import { PostWithDetail } from '../../post/model/post'

export const zodComment = z.object({
    id: zodCommentId,
    content: z.string(), // Use z.string() to validate content as a simple string
    postId: zodPostId,
    author: zodUserShort.optional(),
    likeCount: zodWholeNumber,
    parentId: zodCommentId.optional(),
    createdAt: z.instanceof(Date),
})
export interface Comment extends BasicComment {
    likeCount: WholeNumber
    parentId?: CommentId
    createdAt: Date
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
