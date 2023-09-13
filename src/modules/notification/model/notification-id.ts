import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'

export type NotificationId = Brand<WholeNumber, 'NotificationId'>

export const isNotificationId = (value: unknown): value is NotificationId => {
    return isWholeNumber(value)
}

export const zodNotificationId = z.coerce.number().refine(isNotificationId)
