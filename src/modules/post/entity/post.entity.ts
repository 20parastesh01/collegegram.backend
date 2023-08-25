import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm'
import { Email } from '../../../data/email'
import { WholeNumber } from '../../../data/whole-number'
import { PostId } from '../model/post-id'
import { Caption } from '../model/caption'
import { Tag } from '../model/tag'

@Entity('posts')
export class PostEntity {
    @PrimaryGeneratedColumn()
    id!: PostId

    @Column()
    caption!: Caption

    @Column({type: 'text', array: true })
    photos!: string[]

    @Column({type: 'text', array: true, nullable: true })
    tags!: Tag[]

    @Column()
    auther!: string  //TODO: should be profileID

    @Column('integer', { default: 0 })
    likesCount!: WholeNumber

    @Column('integer', { default: 0 })
    commentsCount!: WholeNumber

    @Column('boolean', { default: false })
    closeFriend!: boolean

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}