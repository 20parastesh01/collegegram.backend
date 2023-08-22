import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type UserId = Brand<WholeNumber, 'UserId'>

export const isUserId = (value: unknown): value is UserId => {
    return isWholeNumber(value)
}

export const zodUserId = z.coerce.number().refine(isUserId)
