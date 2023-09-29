import { z } from 'zod'
import { zodEmail } from '../../../data/email'
import { zodUsername } from '../model/username'
import { zodInputPassword } from '../model/inputpassword'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

export const editProfileDto = z.object({
    email: zodEmail.optional(),
    name: z.string().nonempty().optional(),
    lastname: z.string().nonempty().optional(),
    password: zodInputPassword.optional(),
    private: zodBooleanOrBooleanString.optional(),
    bio: z.string().nonempty().optional(),
    removeProfile: zodBooleanOrBooleanString.default(false)
})

export type EditProfileDto = z.infer<typeof editProfileDto>
