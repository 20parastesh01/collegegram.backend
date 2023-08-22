import { z } from 'zod'
import { Brand } from '../utility/brand'

export type Token = Brand<number, 'Token'>

export const isToken = (value: unknown): value is Token => {
    return (
        typeof value === 'string' &&
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+(\.[A-Za-z0-9-_.+/=]+)?$/.test(value)
    )
}

export const zodToken = z.string().refine(isToken)
