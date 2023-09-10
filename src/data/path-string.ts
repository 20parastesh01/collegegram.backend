import { z } from 'zod'
import { Brand } from '../utility/brand'

export type Path = Brand<string, 'Data Path'>

export const isPath = (value: unknown): value is Path => {
    return typeof value == 'string' && value.length >= 0
}

export const zodPaths = z.array(z.string()).refine(isPath)
