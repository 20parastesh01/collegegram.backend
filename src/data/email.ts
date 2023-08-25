import { z } from 'zod'
import { Brand } from '../utility/brand'

export type Email = Brand<string, 'Email'>

export const isEmail = (value: unknown): value is Email => {
    return typeof value === 'string' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
}

export const zodEmail = z.string().refine(isEmail)
