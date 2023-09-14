import { WholeNumber, zodWholeNumber } from '../../../data/whole-number'
import { UserId, zodUserId } from '../../user/model/user-id'
import { Caption } from './caption'
import { PostId, zodPostId } from './post-id'
import { Tag } from './tag'
import { z } from 'zod'
import { zodTags } from '../model/tag'
import { zodCaption } from '../model/caption'
import { zodBooleanOrBooleanString } from '../../../data/boolean-stringBoolean'
import { zodPaths } from '../../../data/path-string'

export const zodPost = z.object({
    id: zodPostId,
    author: zodUserId,
    closeFriend: zodBooleanOrBooleanString,
    photos: zodPaths.optional(),
    tags: zodTags.optional(),
    likeCount: zodWholeNumber.optional(),
    caption: zodCaption.optional(),
    commentCount: zodWholeNumber.optional(),

})
export const zodStrictPost = z.object({
    id: zodPostId,
    author: zodUserId,
    closeFriend: zodBooleanOrBooleanString.default(false),
    photos: zodPaths.optional(),
    tags: zodTags.optional(),
    likeCount: zodWholeNumber,
    caption: zodCaption,
    commentCount: zodWholeNumber,

})

export type Post = z.infer<typeof zodPost>


export interface PostWithLikeCount extends PostWithoutLikeCount {
    likeCount: WholeNumber
}
export interface PostWithoutLikeCount extends BasicPost {
    
    caption: Caption
    tags?: Tag[]
    commentCount: WholeNumber
}
export interface NewPost {
    author: UserId
    photos?: string[]
    closeFriend: boolean
    caption: Caption
    tags?: Tag[]
}
export interface BasicPost {
    id: PostId
    author: UserId
    photos?: string[]
    closeFriend: boolean
}
