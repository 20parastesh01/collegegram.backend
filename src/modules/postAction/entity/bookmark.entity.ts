import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Column } from 'typeorm'
import { BookmarkId } from '../model/bookmark-id'
import { UserEntity } from '../../user/entity/user.entity'
import { UserId } from '../../user/model/user-id'
import { PostEntity } from '../../post/entity/post.entity'
import { PostId } from '../../post/model/post-id'

@Entity('bookmarks')
export class BookmarkEntity {
    @PrimaryGeneratedColumn()
    id!: BookmarkId

    @Column()
    user_id!: UserId

    @ManyToOne(() => UserEntity, (post) => post.bookmarks, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity

    @Column()
    postId!: PostId

    @ManyToOne(() => PostEntity, (post) => post.bookmarks, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post!: PostEntity

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
