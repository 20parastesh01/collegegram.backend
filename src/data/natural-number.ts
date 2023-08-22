import { z } from 'zod'
import { Brand } from '../utility/brand'

export type NaturalNumber = Brand<number, 'NaturalNumber'>

export const isNaturalNumber = (value: unknown): value is NaturalNumber => {
    return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export const zodNaturalNumber = z.coerce.number().refine(isNaturalNumber)
