import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { UserId } from '../../user/model/user-id'
import { NotificationId } from '../model/notification-id'
import { UserEntity } from '../../user/entity/user.entity'
import { NotificationType } from '../model/notification'
import { PostId } from '../../post/model/post-id'
import { PostEntity } from '../../post/entity/post.entity'
import { CommentEntity } from '../../comment/entity/comment.entity'
import { CommentId } from '../../comment/model/comment-id'

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id!: NotificationId

    @ManyToOne(() => UserEntity)
    user!: UserEntity

    @Column()
    userId!: UserId

    @ManyToOne(() => UserEntity)
    actor!: UserEntity

    @Column()
    actorId!: UserId

    @Column()
    type!: NotificationType

    @Column({ nullable: true })
    postId!: PostId

    @ManyToOne(() => PostEntity)
    post!: PostEntity

    @Column({ nullable: true })
    commentId!: CommentId

    @ManyToOne(() => CommentEntity)
    comment!: CommentEntity

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
