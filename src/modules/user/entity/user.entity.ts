import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { Email } from '../../../data/email'
import { WholeNumber } from '../../../data/whole-number'
import { Password } from '../model/password'
import { UserId } from '../model/user-id'
import { Username } from '../model/username'
import { LikeEntity } from '../../post/entity/like.entity'

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
    
    @OneToMany(() => LikeEntity, (like)=>like.post , { lazy: true ,onDelete: 'CASCADE'})
    @JoinColumn({ name: 'like_id' })
    likes: LikeEntity[] | undefined

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
