import { z } from 'zod'
import { Brand } from '../utility/brand'

export type WholeNumber = Brand<number, 'Whole Number'>

export const isWholeNumber = (value: unknown): value is WholeNumber => {
    return typeof value == 'number' && Number.isInteger(value) && value > 0
}

export const zodWholeNumber = z.coerce.number().refine(isWholeNumber)
