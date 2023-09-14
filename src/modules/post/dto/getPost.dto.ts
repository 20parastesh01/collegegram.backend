import { z } from 'zod'
import { isJustId } from '../../../data/just-id'

export const zodGetPostDTO = z.coerce.number().refine(isJustId)
