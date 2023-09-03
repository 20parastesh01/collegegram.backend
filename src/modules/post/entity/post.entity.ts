import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { PostId } from '../model/post-id'
import { Caption } from '../model/caption'
import { Tag } from '../model/tag'
import { UserId } from '../../user/model/user-id'
import { UserEntity } from '../../user/entity/user.entity'

@Entity('posts')
export class PostEntity {
    @PrimaryGeneratedColumn()
    id!: PostId

    @Column()
    caption!: Caption

    @Column('integer', { default: 0 })
    photosCount!: WholeNumber

    @Column({ type: 'text', array: true, default: [], nullable:true })
    tags?: Tag[]

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    author!: UserId

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
