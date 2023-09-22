import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type LikeId = Brand<WholeNumber, 'LikeId'>

export const isLikeId = (value: unknown): value is LikeId => {
    return isWholeNumber(value)
}

export const zodLikeId = z.coerce.number().refine(isLikeId)
