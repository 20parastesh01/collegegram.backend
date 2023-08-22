import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'
import { NonEmptyString } from '../../../data/non-empty-string'

export type Username = Brand<NonEmptyString, 'Username'>

export const isUsername = (value: unknown): value is Username => {
    return typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9_]{5,63}$/.test(value)
}

export const zodUsername = z.string().refine(isUsername)
