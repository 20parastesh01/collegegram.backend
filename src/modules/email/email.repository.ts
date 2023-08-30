import { DataSource, Repository } from 'typeorm'
import { Email } from '../../data/email'
import { Repo } from '../../registry/layer-decorators'
import { EmailEntity } from './entity/email.entity'

export interface CreateEmail {
    to: Email
    subject: string
    content: string
    reason: string
}

export interface IEmailRepository {
    create(data: CreateEmail): Promise<EmailEntity>
}

@Repo()
export class EmailRepository implements IEmailRepository {
    private emailRepo: Repository<EmailEntity>

    constructor(appDataSource: DataSource) {
        this.emailRepo = appDataSource.getRepository(EmailEntity)
    }

    create(data: CreateEmail): Promise<EmailEntity> {
        return this.emailRepo.save({ ...data })
    }
}
