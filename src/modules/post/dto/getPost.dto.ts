import { ZodType, z } from 'zod'
import { PostId, isPostId, zodPostId } from '../model/post-id'

export const zodGetPostDTO = z.coerce.number().refine(isPostId)
