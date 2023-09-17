import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { CommentId } from '../model/comment-id'
import { Content } from '../model/content'
import { PostId } from '../../post/model/post-id'
import { PostEntity } from '../../post/entity/post.entity'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { ParentId } from '../model/parent-id'

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id!: CommentId

    @Column()
    content!: Content

    @ManyToOne(() => PostEntity)
    @JoinColumn()
    postId!: PostId

    @ManyToOne(() => CommentEntity, { nullable: true })
    @JoinColumn()
    parentId?: ParentId

    @ManyToOne(() => UserEntity, { eager: true, cascade : true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    author!: UserEntity;

    @Column('integer', { default: 0 })
    likeCount!: WholeNumber

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
