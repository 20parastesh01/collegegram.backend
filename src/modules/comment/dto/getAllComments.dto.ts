import { z } from 'zod';
import { isPostId } from '../../post/model/post-id';


export const zodGetAllCommentsDTO = z.coerce.number().refine(isPostId)