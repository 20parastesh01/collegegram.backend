import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { NonEmptyString } from '../../../data/non-empty-string'

export type InputPassword = Brand<NonEmptyString, 'InputPassword'>

export const isInputPassword = (value: unknown): value is InputPassword => {
    return typeof value === 'string' && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/.test(value)
}

export const zodInputPassword = z.string().refine(isInputPassword)
