import { MinioRepo } from '../../../data-source'
import { Service, services } from '../../../registry/layer-decorators'
import { Comment } from '../../comment/model/comment'
import { BasicPost } from '../../post/model/post'
import type { RelationService } from '../../user/bll/relation.service'
import { UserId } from '../../user/model/user-id'
import { NotificationType, NotificationWithRelation } from '../model/notification'
import { INotificationRepository, NotificationRepository } from '../notification.repo'

@Service(NotificationRepository)
export class NotificationService {
    constructor(private notifRepo: INotificationRepository) {}

    async createFollowNotification(user: UserId, actor: UserId) {
        const notification = await this.notifRepo.create({
            actorId: actor,
            userId: user,
            type: 'Follow',
        })
        return notification
    }

    async createAcceptNotification(user: UserId, actor: UserId) {
        const notification = await this.notifRepo.create({
            actorId: actor,
            userId: user,
            type: 'Accept',
        })
        return notification
    }

    async createLikeNotification(user: UserId, actor: UserId, post: BasicPost) {
        const notification = await this.notifRepo.create({
            actorId: actor,
            userId: user,
            type: 'Like',
            postId: post.id,
        })
        return notification
    }

    async createCommentNotification(user: UserId, actor: UserId, comment: Comment) {
        const notification = await this.notifRepo.create({
            actorId: actor,
            userId: user,
            type: 'Comment',
            commentId: comment.id,
            postId: comment.postId,
        })
        return notification
    }

    async createRequestNotification(user: UserId, actor: UserId) {
        const notification = await this.notifRepo.create({
            actorId: actor,
            userId: user,
            type: 'Request',
        })
        return notification
    }

    async getUserNotifications(user: UserId) {
        const notifications = await this.notifRepo.getNotificationByUser(user)
        return notifications
    }

    async getUserNotificationsWithRelation(user: UserId) {
        const notifications = (await this.notifRepo.getNotificationByUser(user)).toNotificationList()
        const result: NotificationWithRelation[] = []
        for (let notif of notifications) {
            const userProf = await MinioRepo.getProfileUrl(notif.user.id)
            const actorProf = await MinioRepo.getProfileUrl(notif.actor.id)
            if (userProf) notif.user.photo = userProf
            if (actorProf) notif.actor.photo = actorProf
            const relationService = services['RelationService'] as RelationService
            const relations = await relationService.getRelations(notif.actor.id, notif.user.id)
            result.push({ ...notif, relation: relations.relation?.status, reverseRelation: relations.reverseRelation?.status })
        }
        return result
    }

    async getFriendNotification(userId:UserId) {
        const friends = await (services['RelationService'] as RelationService).getAllFollowingIds(userId)
        const notifs = await this.notifRepo.getNotificationByUserList(friends)
        return notifs
    }

    async deleteNotification(user: UserId, actor: UserId, type: NotificationType) {
        await this.notifRepo.deleteNotification(user, actor, type)
    }
}
