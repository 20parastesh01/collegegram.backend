import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { WholeNumber, isWholeNumber } from '../../../data/whole-number'
import { NonEmptyString } from '../../../data/non-empty-string'

export type Tag = Brand<NonEmptyString, 'Tag'>

const SevenWordsValidator = (str: string): str is Tag => {
  const words = str.trim().split(/\s+/);
  return words.length < 8 ? true : false;
};

export const isTag = (value: string): value is Tag => {
    return typeof value === 'string' && /^(?!.*#).*$/.test(value)
}
const combineAllValidator = (str: string): str is Tag => {
  return SevenWordsValidator(str) && isTag(str);
};

export const zodTag = z.string().refine(combineAllValidator)
