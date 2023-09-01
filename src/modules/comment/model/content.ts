import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { NonEmptyString } from '../../../data/non-empty-string'

export type Content = Brand<NonEmptyString, 'Content'>

export const isContent = (value: unknown): value is Content => {
    return typeof value === 'string' && value.length <= 255
}

export const zodContent = z.string().refine(isContent)
