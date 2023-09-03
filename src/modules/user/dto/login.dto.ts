import { z } from 'zod'
import { zodEmail } from '../../../data/email'
import { zodUsername } from '../model/username'
import { zodInputPassword } from '../model/inputpassword'

export const loginDto = z.object({
    usernameOrEmail: zodUsername.or(zodEmail),
    password: zodInputPassword,
    rememberMe: z.boolean().default(false),
})

export type LoginDto = z.infer<typeof loginDto>
