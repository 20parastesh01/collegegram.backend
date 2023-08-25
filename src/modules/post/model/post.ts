import { Email } from '../../../data/email'
import { Hashed } from '../../../data/hashed'
import { NonEmptyString } from '../../../data/non-empty-string'
import { Token } from '../../../data/token'
import { WholeNumber } from '../../../data/whole-number'
import { Username } from '../../user/model/username'
import { Caption } from './caption'
import { PostId } from './post-id'
import { Tag } from './tag'

export interface Post {
    id: PostId
    caption: Caption
    likesCount: WholeNumber
    tags: Tag[]
    auther: string //TODO: should be ProfileID
    photos: string[]
    commentsCount: WholeNumber
    closeFriend: boolean
}

export interface thumbnailPost {
    id: PostId
    auther: string //TODO: should be ProfileID
    photos: string[]
    closeFriend: boolean
}
