import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'
import { NonEmptyString } from '../../../data/non-empty-string'
import { Hashed, isHashed } from '../../../data/hashed'

export type Password = Brand<Hashed, 'Password'>

export const isPassword = (value: unknown): value is Password => {
    return isHashed(value)
}

export const zodPassword = z.string().refine(isPassword)
