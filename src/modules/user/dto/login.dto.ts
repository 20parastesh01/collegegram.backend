import { z } from 'zod'
import { zodEmail } from '../../../data/email'
import { zodUsername } from '../model/username'
import { zodInputPassword } from '../model/inputpassword'

export const loginDto = z.object({
    usernameOrEmail: zodUsername.or(zodEmail),
    password: zodInputPassword,
    rememberMe: z
        .string()
        .default('false')
        .transform((x) => {
            return typeof x === 'string' && x.toLowerCase() == 'true'
        }),
})

export type LoginDto = z.infer<typeof loginDto>
