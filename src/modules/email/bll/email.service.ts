import { Email } from '../../../data/email'
import { Service } from '../../../registry/layer-decorators'
import { BadRequestError, ServerError } from '../../../utility/http-error'
import { EmailRepository, IEmailRepository } from '../email.repository'
import { EmailEntity } from '../entity/email.entity'

export interface IEmailService {
    createEmail(to: Email, subject: string, content: string, reason: string): Promise<EmailEntity>
}

@Service(EmailRepository)
export class EmailService implements IEmailService {
    constructor(private emailRepo: IEmailRepository) {}

    createEmail(to: Email, subject: string, content: string, reason: string) {
        return this.emailRepo.create({ to, subject, content, reason })
    }
}
