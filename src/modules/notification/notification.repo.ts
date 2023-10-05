import { DataSource, In, Repository } from 'typeorm'
import { NotificationEntity } from './entity/notification.entity'
import { Email } from '../../data/email'
import { NotificationId } from './model/notification-id'
import { Repo } from '../../registry/layer-decorators'
import { notificationDao, notificationListDao } from './bll/notification.dao'
import { WholeNumber } from '../../data/whole-number'
import { User } from '../user/model/user'
import { NotificationType } from './model/notification'
import { Comment } from '../comment/model/comment'
import { UserId } from '../user/model/user-id'
import { PostId } from '../post/model/post-id'
import { CommentId } from '../comment/model/comment-id'

export interface CreateNotification {
    userId: UserId
    actorId: UserId
    type: NotificationType
    postId?: PostId
    commentId?: CommentId
}

export interface INotificationRepository {
    create(data: CreateNotification): Promise<ReturnType<typeof notificationDao>>
    getNotificationByUser(userId: UserId): Promise<ReturnType<typeof notificationListDao>>
    getNotificationByUserList(userIds: UserId[]): Promise<ReturnType<typeof notificationListDao>>
    deleteNotification(userId: UserId, actorId: UserId, type: NotificationType): Promise<void>
}

@Repo()
export class NotificationRepository implements INotificationRepository {
    private notificationRepo: Repository<NotificationEntity>

    constructor(appDataSource: DataSource) {
        this.notificationRepo = appDataSource.getRepository(NotificationEntity)
    }

    async create(data: CreateNotification) {
        const notificationEntity = await this.notificationRepo.save(data)
        return notificationDao(notificationEntity)
    }

    async getNotificationByUser(userId: UserId) {
        const notificationEntities = await this.notificationRepo.find({ where: { userId }, relations: ['actor', 'user', 'post', 'comment'] })
        return notificationListDao(notificationEntities)
    }

    async getNotificationByUserList(userIds: UserId[]) {
        const notificationEntities = await this.notificationRepo.find({ where: { actor: In(userIds), type: In(['Like', 'Comment', 'Follow']) }, relations: ['actor', 'user', 'post', 'comment'] })
        return notificationListDao(notificationEntities)
    }

    async deleteNotification(userId: UserId, actorId: UserId, type: NotificationType) {
        await this.notificationRepo.delete({ userId, actorId, type })
    }
}
