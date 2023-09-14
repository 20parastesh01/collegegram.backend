import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { WholeNumber } from '../../../data/whole-number'
import { PostId } from '../model/post-id'
import { Caption } from '../model/caption'
import { Tag } from '../model/tag'
import { UserId } from '../../user/model/user-id'
import { UserEntity } from '../../user/entity/user.entity'
import { LikeEntity } from './like.entity'

@Entity('posts')
export class PostEntity {
    @PrimaryGeneratedColumn()
    id!: PostId

    @Column()
    caption!: Caption

    @Column({ type: 'text', array: true, default: [], nullable:true })
    tags?: Tag[]

    @ManyToOne(() => UserEntity , { eager: true})
    @JoinColumn()
    author!: UserId

    @Column('integer', { default: 0 })
    commentCount!: WholeNumber

    @Column('boolean', { default: false })
    closeFriend!: boolean

    @OneToMany((type) => LikeEntity, (like)=>like.post , { lazy: true ,onDelete: 'CASCADE'})
    @JoinColumn({ name: 'like_id' })
    likes: LikeEntity[] | undefined

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
