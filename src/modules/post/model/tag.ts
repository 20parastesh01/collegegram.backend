import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'
import { NonEmptyString } from '../../../data/non-empty-string'

export type Tag = Brand<NonEmptyString, 'Tag'>

export const isTag = (value: unknown): value is Tag => {
    return typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9_]{5,63}$/.test(value)
}

export const zodTag = z.string().refine(isTag)
