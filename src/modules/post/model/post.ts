import { WholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { Caption } from './caption'
import { PostId } from './post-id'
import { Tag } from './tag'

export interface Post extends basePost {
    id: PostId
    caption: Caption
    likesCount: WholeNumber
    tags: Tag[]
    commentsCount: WholeNumber
}
export interface newPost extends basePost {
    caption: Caption
    tags: Tag[]
}
export interface basePost {
    author: UserId
    photos: string[]
    closeFriend: boolean
}
