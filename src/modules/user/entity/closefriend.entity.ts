import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { UserId } from '../model/user-id'

@Entity('closeFriends')
export class CloseFriendEntity {
    @PrimaryColumn()
    userA!: UserId

    @PrimaryColumn()
    userB!: UserId

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
