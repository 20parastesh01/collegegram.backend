import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { PostId } from '../model/post-id'
import { Caption } from '../model/caption'
import { Tag } from '../model/tag'
import { UserId } from '../../user/model/user-id'
import { UserEntity } from '../../user/entity/user.entity'
import { CommentEntity } from '../../comment/entity/comment.entity'
import { BookmarkEntity } from '../../postAction/entity/bookmark.entity'
import { LikeEntity } from '../../postAction/entity/like.entity'

@Entity('posts')
export class PostEntity {
    @PrimaryGeneratedColumn()
    id!: PostId

    @Column()
    caption!: Caption

    @Column({ type: 'text', array: true, default: [], nullable: true })
    tags?: Tag[]

    @Column()
    author!: UserId

    @Column('integer', { name: 'commentCount', default: 0 })
    commentCount!: WholeNumber

    @Column('integer', { name: 'likeCount', default: 0 })
    likeCount!: WholeNumber

    @Column('integer', { name: 'bookmarkCount', default: 0 })
    bookmarkCount!: WholeNumber

    @Column('boolean', { default: false })
    closeFriend!: boolean

    @OneToMany((type) => LikeEntity, (like) => like.post, { lazy: true })
    @JoinColumn({ name: 'likeId' })
    likes: LikeEntity[] | undefined

    @OneToMany((type) => BookmarkEntity, (bookmark) => bookmark.post, { lazy: true })
    @JoinColumn({ name: 'bookmarkId' })
    bookmarks: BookmarkEntity[] | undefined

    @OneToMany((type) => CommentEntity, (comment) => comment.post, { lazy: true })
    @JoinColumn({ name: 'commentId' })
    comments: CommentEntity[] | undefined

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
