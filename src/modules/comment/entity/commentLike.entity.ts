import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { CommentEntity } from './comment.entity'
import { CommentId } from '../model/comment-id'
import { LikeId } from '../../postAction/model/like-id'

@Entity('CommentLikes')
export class CommentLikeEntity {
    @PrimaryGeneratedColumn()
    id!: LikeId

    @ManyToOne(() => UserEntity, (entity: UserEntity) => entity.id, { eager: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserId

    @ManyToOne(() => CommentEntity, { eager: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    comment!: CommentEntity

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
