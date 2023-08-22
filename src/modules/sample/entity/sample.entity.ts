import {
    Collection,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { SampleId } from '../model/sample-id'
import { Email } from '../../../data/email'
import { Token } from '../../../data/token'

@Entity('samples')
export class SampleEntity {
    @PrimaryGeneratedColumn()
    id!: SampleId

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
