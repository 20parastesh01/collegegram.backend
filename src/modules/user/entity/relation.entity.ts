import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { UserId } from '../model/user-id'
import { RelationStatus } from '../model/relation'



@Entity('relations')
export class RelationEntity {
    @PrimaryColumn()
    @Column()
    userA!: UserId

    @PrimaryColumn()
    @Column()
    userB!: UserId

    @Column()
    status!: RelationStatus

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
