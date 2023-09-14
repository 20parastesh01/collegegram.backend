import { z } from 'zod'
import { isUserId } from '../../user/model/user-id'

export const zodGetAllPostsDTO = z.coerce.number().refine(isUserId)
