import { z } from 'zod'
import { Brand } from '../utility/brand'

export type NonEmptyString = Brand<string, 'NonEmptyString'>

export const isNonEmptyString = (value: unknown): value is NonEmptyString => {
    return typeof value === 'string' && value.length > 0
}

export const zodNonEmptyString = z.string().refine(isNonEmptyString)
