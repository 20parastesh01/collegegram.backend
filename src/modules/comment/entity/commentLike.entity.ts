import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Column } from 'typeorm'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { CommentEntity } from './comment.entity'
import { CommentId } from '../model/comment-id'
import { LikeId } from '../../postAction/model/like-id'

@Entity('CommentLikes')
export class CommentLikeEntity {
    @PrimaryGeneratedColumn()
    id!: LikeId

    @Column()
    userId!: UserId

    @ManyToOne(() => UserEntity, { eager: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity

    @Column()
    commentId!: CommentId

    @ManyToOne(() => CommentEntity, (comment)=> comment.likes, { eager: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commentId' })
    comment!: CommentEntity

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
