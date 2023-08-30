import { z } from 'zod'
import { zodInputPassword } from '../model/inputpassword'

export const setPasswordDto = z.object({
    newPassword: zodInputPassword,
    token: z.string(),
})

export type SetPasswordDto = z.infer<typeof setPasswordDto>
