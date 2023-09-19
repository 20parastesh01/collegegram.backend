import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { CommentId } from '../model/comment-id'
import { Content } from '../model/content'
import { PostId } from '../../post/model/post-id'
import { PostEntity } from '../../post/entity/post.entity'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { ParentId } from '../model/parent-id'
import { CommentLikeEntity } from './commentLike.entity'

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id!: CommentId

    @Column()
    content!: Content

    @ManyToOne(() => PostEntity, (post:PostEntity)=>post.id)
    @JoinColumn()
    postId!: PostId

    @ManyToOne(() => CommentEntity, (comment:CommentEntity)=>comment.id, { nullable: true })
    @JoinColumn()
    parentId?: ParentId

    @ManyToOne(() => UserEntity, { eager: true, cascade : true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    author!: UserEntity;

    @OneToMany((type) => CommentLikeEntity, (commentLike: CommentLikeEntity)=>commentLike.comment , { lazy: true })
    @JoinColumn({ name: 'like_id' })
    likes: CommentLikeEntity[] | undefined

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
