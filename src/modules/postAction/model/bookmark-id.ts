import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type BookmarkId = Brand<WholeNumber, 'BookmarkId'>

export const isBookmarkId = (value: unknown): value is BookmarkId => {
    return isWholeNumber(value)
}

export const zodBookmarkId = z.coerce.number().refine(isBookmarkId)
