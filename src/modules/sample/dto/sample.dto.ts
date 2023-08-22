import { z } from 'zod'
import { zodEmail } from '../../../data/email'

export const sampleDto = z.object({
    somefield: zodEmail,
})

export type SampleDto = z.infer<typeof sampleDto>
