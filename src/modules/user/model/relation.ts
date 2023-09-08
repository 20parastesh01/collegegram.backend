import { UserId } from './user-id'

export type RelationStatus = 'Following' | 'Pending' | 'Blocked'

export type Relation = {
    userA: UserId
    userB: UserId
    status: RelationStatus
}
