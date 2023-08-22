import { z } from 'zod'
import { Brand } from '../utility/brand'

export type Hashed = Brand<string, 'Hashed'>

export const isHashed = (value: unknown): value is Hashed => {
    return typeof value === 'string' && /^\$2[ayb]\$.{56}$/.test(value)
}

export const zodHashed = z.string().refine(isHashed)
