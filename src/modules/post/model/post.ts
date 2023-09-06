import { WholeNumber } from '../../../data/whole-number'
import { UserId } from '../../user/model/user-id'
import { Caption } from './caption'
import { PostId } from './post-id'
import { Tag } from './tag'

export interface PostWithLikesCount extends PostWithoutLikesCount {
    likesCount: WholeNumber
}
export interface PostWithoutLikesCount extends BasePost {
    id: PostId
    caption: Caption
    tags?: Tag[]
    commentsCount: WholeNumber
}
export interface NewPost extends BasePost {
    caption: Caption
    tags?: Tag[]
}
export interface BasePost {
    author: UserId
    photos?: string[]
    photosCount: WholeNumber
    closeFriend: boolean
}
