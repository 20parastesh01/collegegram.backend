import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { CommentId } from '../model/comment-id'
import { Content } from '../model/content'
import { PostId } from '../../post/model/post-id'
import { PostEntity } from '../../post/entity/post.entity'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { CommentLikeEntity } from './commentLike.entity'
import { LikeId } from '../../postAction/model/like-id'

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id!: CommentId

    @Column()
    content!: Content

    @ManyToOne(() => PostEntity, (post:PostEntity)=>post.id)
    @JoinColumn()
    postId!: PostId

    @ManyToOne(() => CommentEntity, (comment)=>comment.id, { nullable: true })
    @JoinColumn()
    parentId?: CommentId

    @Column('integer', { name: 'likeCount', default: 0 })
    likeCount!: WholeNumber

    @ManyToOne(() => UserEntity, { eager: true, cascade : true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    author!: UserEntity;

    @OneToMany(() => CommentLikeEntity, (commentLikes)=>commentLikes.comment , { lazy: true })
    @JoinColumn({ name: 'like_id' })
    likes: CommentLikeEntity[] | undefined

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
