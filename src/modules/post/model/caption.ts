import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { NonEmptyString } from '../../../data/non-empty-string'

export type Caption = Brand<NonEmptyString, 'Caption'>

export const isCaption = (value: unknown): value is Caption => {
    return typeof value === 'string' && value.length <= 255
}

export const zodCaption = z.string().refine(isCaption)
