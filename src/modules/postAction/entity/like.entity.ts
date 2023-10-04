import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Column } from 'typeorm'
import { LikeId } from '../model/like-id'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { PostEntity } from '../../post/entity/post.entity'
import { PostId } from '../../post/model/post-id'

@Entity('likes')
export class LikeEntity {
    @PrimaryGeneratedColumn()
    id!: LikeId

    @Column()
    userId!: UserId

    @ManyToOne(() => UserEntity, { eager: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity

    @Column()
    postId!: PostId

    @ManyToOne(() => PostEntity, { eager: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post!: PostEntity

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
