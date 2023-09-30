import { z } from 'zod'
import { zodContent } from '../model/content'
import { zodCommentId } from '../model/comment-id'
import { zodJustId } from '../../../data/just-id'

export const zodCreateCommentDTO = z.object({
    content: zodContent,
    parentId: zodCommentId.optional(),
    postId: zodJustId,
})

export type CreateCommentDTO = z.infer<typeof zodCreateCommentDTO>
