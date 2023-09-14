import { z } from 'zod'
import { Brand } from '../utility/brand'
import { WholeNumber, isWholeNumber } from './whole-number'

export type JustId = Brand<WholeNumber, 'Just Id'>

export const isJustId = (value: unknown): value is JustId => {
    return isWholeNumber(value)
}

export const zodJustId = z.coerce.number().refine(isJustId)
