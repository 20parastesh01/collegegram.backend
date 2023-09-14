import { zodWholeNumber } from '../../../data/whole-number'
import { commentDao, commentOrNullDao } from '../../comment/bll/comment.dao'
import { CommentEntity } from '../../comment/entity/comment.entity'
import { postWithoutDetailOrNullDao } from '../../post/bll/post.dao'
import { userDao } from '../../user/bll/user.dao'
import { NotificationEntity } from '../entity/notification.entity'
import { Notification } from '../model/notification'

export const notificationDao = (input: NotificationEntity) => {
    return {
        toNotification(): Notification {
            const user = userDao(input.user)!.toUserShort()
            const actor = userDao(input.actor)!.toUserShort()
            const post = postWithoutDetailOrNullDao(input.post).toPost()
            const comment = commentOrNullDao(input.comment).toCommentModel()
            const { type, id } = input
            return { user, actor, post, comment, type, id }
        },
    }
}

export const notificationListDao = (inputs: NotificationEntity[]) => {
    return {
        toNotificationList(): Notification[] {
            return inputs.map((input) => {
                const user = userDao(input.user)!.toUserShort()
                const actor = userDao(input.actor)!.toUserShort()
                const post = postWithoutDetailOrNullDao(input.post).toPost()
                const comment = commentOrNullDao(input.comment).toCommentModel()
                const { type, id } = input
                return { user, actor, post, comment, type, id }
            })
        },
    }
}
