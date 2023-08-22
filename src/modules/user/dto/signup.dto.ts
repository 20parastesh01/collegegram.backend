import { z } from 'zod'
import { zodEmail } from '../../../data/email'
import { zodUsername } from '../model/username'
import { zodInputPassword } from '../model/inputpassword'

export const signupDto = z.object({
    username: zodUsername,
    email: zodEmail,
    password: zodInputPassword,
})

export type SignUpDto = z.infer<typeof signupDto>
