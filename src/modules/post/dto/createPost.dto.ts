import { z } from 'zod'
import { zodTags } from '../model/tag'
import { zodCaption } from '../model/caption'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'

export const zodCreatePostDTO = z.object({
    tags: zodTags.optional(),
    caption: zodCaption,
    closeFriend: zodBooleanOrBooleanString.default(false),
    // closeFriend: z.string().transform((x) => {
    //     return typeof x === 'string' && x.toLowerCase() == 'true'
    // }),
})

export type CreatePostDTO = z.infer<typeof zodCreatePostDTO>
