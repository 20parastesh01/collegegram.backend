import { ZodType, z } from 'zod';
import { PostId, isPostId, zodPostId } from '../model/comment-id';


export const zodGetPostDTO = z.coerce.number().refine(isPostId)