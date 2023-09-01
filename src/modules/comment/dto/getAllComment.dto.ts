import { z } from 'zod';
import { isUserId } from '../../user/model/user-id';


export const zodGetAllPostDTO = z.coerce.number().refine(isUserId)