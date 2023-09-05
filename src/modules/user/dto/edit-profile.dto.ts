import { z } from 'zod'
import { zodEmail } from '../../../data/email'
import { zodUsername } from '../model/username'
import { zodInputPassword } from '../model/inputpassword'

export const editProfileDto = z.object({
    email: zodEmail.optional(),
    name: z.string().nonempty().optional(),
    lastname: z.string().nonempty().optional(),
    password: zodInputPassword.optional(),
    private: z.boolean().optional(),
    bio: z.string().nonempty().optional(),
})

export type EditProfileDto = z.infer<typeof editProfileDto>
