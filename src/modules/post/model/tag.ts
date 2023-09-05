import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { NonEmptyString } from '../../../data/non-empty-string'

const TagsSchema = z.array(z.string())

export type Tag = Brand<NonEmptyString, 'Tag'>

const spliter = (str: string): string[] => {
    const words = str
        .trim()
        .split(/\s+/)
        .map((x) => x.trim())
    return words
}

export const isTag = (value: string): value is Tag => {
    return typeof value === 'string' && /^(?!.*#).*$/.test(value) //&& value.length <= 25
}

export const isTags = (tagsArray: string[]): tagsArray is Tag[] => {
    const validatedTags = tagsArray.every((tag) => isTag(tag))

    return tagsArray.length < 8 && tagsArray.length > 0 && validatedTags
}

export const zodTags = z
    .string()
    .transform((x) => spliter(x))
    .refine(isTags)
//export const zodTag = z.string().refine(isTag)
