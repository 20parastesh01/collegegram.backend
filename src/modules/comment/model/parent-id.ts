import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber } from '../../../data/whole-number'
import { isCommentId } from './comment-id'

export type ParentId = Brand<WholeNumber, 'ParentId'> 

export const isParentId = (value: unknown): value is ParentId=> {
        return isCommentId(value)    
}

export const zodParentId = z.number().nullable().refine(isParentId);
