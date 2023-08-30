import { z } from 'zod'
import { zodEmail } from '../../../data/email'
import { zodUsername } from '../model/username'

export const sendEmailDto = z.object({
    usernameOrEmail: zodUsername.or(zodEmail),
})

export type SendEmailDto = z.infer<typeof sendEmailDto>
