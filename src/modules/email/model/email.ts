import { Email } from '../../../data/email'
import { EmailId } from './email-id'

interface EmailHistory {
    id: EmailId
    to: Email
    subject: string
    content: string
    reason: string
}
