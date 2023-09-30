import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { Email } from '../../../data/email'
import { WholeNumber } from '../../../data/whole-number'
import { Password } from '../model/password'
import { UserId } from '../model/user-id'
import { Username } from '../model/username'
import { BookmarkEntity } from '../../postAction/entity/bookmark.entity'
import { LikeEntity } from '../../postAction/entity/like.entity'

@Entity('users')
@Unique(['username'])
@Unique(['email'])
export class UserEntity {
    @PrimaryGeneratedColumn()
    id!: UserId

    @Column()
    username!: Username

    @Column()
    password!: Password

    @Column()
    email!: Email

    @Column({ default: '' })
    name!: string

    @Column({ default: '' })
    lastname!: string

    @Column('integer', { default: 0 })
    followers!: WholeNumber

    @Column('integer', { default: 0 })
    following!: WholeNumber

    @Column({ default: '' })
    bio!: string

    @Column('integer', { default: 0 })
    postsCount!: WholeNumber

    @Column('boolean', { default: false })
    private!: boolean

    @OneToMany(() => LikeEntity, (like) => like.user, { lazy: true })
    @JoinColumn({ name: 'likeId' })
    likes?: LikeEntity[]

    @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.user, { lazy: true })
    @JoinColumn({ name: 'bookmarkId' })
    bookmarks?: BookmarkEntity[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
