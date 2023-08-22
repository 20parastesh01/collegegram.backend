import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type SampleId = Brand<WholeNumber, 'SampleId'>

export const isSampleId = (value: unknown): value is SampleId => {
    return isWholeNumber(value)
}

export const zodSampleId = z.coerce.number().refine(isSampleId)
