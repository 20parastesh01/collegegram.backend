import { z } from 'zod'
import { Brand } from '../utility/brand'

export type WholeNumber = Brand<number, 'WholeNumber'>

export const isWholeNumber = (value: unknown): value is WholeNumber => {
    return typeof value === 'number' && Number.isInteger(value)
}

export const zodWholeNumber = z.coerce.number().refine(isWholeNumber)
