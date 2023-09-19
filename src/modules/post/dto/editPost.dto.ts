import { z } from 'zod'
import { zodTags } from '../model/tag'
import { zodCaption } from '../model/caption'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'
import { zodJustId } from '../../../data/just-id'

export const zodEditPostDTO = z.object({
    id: zodJustId,
    tags: zodTags.optional(),
    caption: zodCaption,
    closeFriend: zodBooleanOrBooleanString.default(false),
    // closeFriend: z.string().transform((x) => {
    //     return typeof x === 'string' && x.toLowerCase() == 'true'
    // }),
})

export type EditPostDTO = z.infer<typeof zodEditPostDTO>
