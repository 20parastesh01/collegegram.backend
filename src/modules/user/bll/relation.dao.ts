import { Brand } from '../../../utility/brand'
import { RelationEntity } from '../entity/relation.entity'
import { Relation } from '../model/relation'

export const relationDao = (input: RelationEntity | null) => {
    if (!input) return null
    return {
        toRelation(): Relation {
            return input
        },
    }
}
export const relationListDao = (input: RelationEntity[]) => {
    return {
        toRelationList(): Relation[] {
            return input.map((relation) => relation)
        },
    }
}
