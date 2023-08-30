import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type EmailId = Brand<WholeNumber, 'EmailId'>

export const isEmailId = (value: unknown): value is EmailId => {
    return isWholeNumber(value)
}

export const zodEmailId = z.coerce.number().refine(isEmailId)
