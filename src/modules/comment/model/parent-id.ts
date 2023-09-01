import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber } from '../../../data/whole-number'
import { isCommentId } from './comment-id'

export type ParentId = Brand<WholeNumber, 'ParentId'> 

export const isParentId = (value: unknown): value is (ParentId | undefined )=> {
    if (value === null) {
        return true
    }
    else{
        return isCommentId(value)    
    }
}

export const zodParentId = z
  .union([z.number().nullable(), z.undefined()])
  .refine(isParentId);
