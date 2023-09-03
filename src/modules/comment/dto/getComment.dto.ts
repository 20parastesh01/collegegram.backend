import { ZodType, z } from 'zod';
import { CommentId, isCommentId, zodCommentId } from '../model/comment-id';


export const zodGetCommentDTO = z.coerce.number().refine(isCommentId)