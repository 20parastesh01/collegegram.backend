import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { CommentId } from '../model/comment-id'
import { Content } from '../model/content'
import { PostId } from '../../post/model/post-id'
import { PostEntity } from '../../post/entity/post.entity'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id!: CommentId

    @Column()
    content!: Content

    @ManyToOne(() => PostEntity)
    @JoinColumn()
    postId!: PostId

    @ManyToOne(() => CommentEntity)
    @JoinColumn()
    parentId?: CommentId | null
    
    @ManyToOne(() => UserEntity)
    @JoinColumn()
    author!: UserId

    @Column('integer', { default: 0 })
    likesCount!: WholeNumber

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}