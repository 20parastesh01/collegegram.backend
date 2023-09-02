import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type CommentId = Brand<WholeNumber, 'CommentId'>

export const isCommentId = (value: unknown): value is CommentId => {
    return isWholeNumber(value)
}

export const zodCommentId = z.coerce.number().refine(isCommentId)
