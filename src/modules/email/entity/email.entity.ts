import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { Email } from '../../../data/email'
import { WholeNumber } from '../../../data/whole-number'
import { EmailId } from '../model/email-id'

@Entity('emails')
export class EmailEntity {
    @PrimaryGeneratedColumn()
    id!: EmailId

    @Column()
    to!: Email

    @Column()
    subject!: string

    @Column()
    content!: string

    @Column()
    reason!: string

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
