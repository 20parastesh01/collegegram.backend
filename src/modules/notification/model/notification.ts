import { CommentWithDetail } from '../../comment/comment.repository'
import { Comment } from '../../comment/model/comment'
import { BasicPost, Post } from '../../post/model/post'
import { RelationStatus } from '../../user/model/relation'
import { User, UserShort } from '../../user/model/user'
import { NotificationId } from './notification-id'

export type NotificationType = 'Like' | 'Comment' | 'Follow' | 'Request'

export interface Notification {
    id: NotificationId

    user: UserShort

    actor: UserShort

    type: NotificationType

    post?: BasicPost

    comment?: Comment
}

export interface NotificationWithRelation extends Notification {
    relation?: RelationStatus
    reverseRelation?: RelationStatus
}
