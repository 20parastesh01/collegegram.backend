import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type PostId = Brand<WholeNumber, 'PostId'>

export const isPostId = (value: unknown): value is PostId => {
    return isWholeNumber(value)
}

export const zodPostId = z.coerce.number().refine(isPostId)
