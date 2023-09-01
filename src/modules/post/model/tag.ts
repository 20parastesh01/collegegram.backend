import { z } from 'zod'
import { Brand } from '../../../utility/brand'
import { NonEmptyString } from '../../../data/non-empty-string'

export type Tag = Brand<NonEmptyString, 'Tag'>

const SevenWordsValidator = (str: string): str is Tag => {
  const words = str.trim().split(/\s+/);
  return words.length < 8;
};

export const isTag = (value: string): value is Tag => {
  return typeof value === 'string' && /^(?!.*#).*$/.test(value) //&& value.length <= 25
}

export const combineAllValidator = (tagsArray: string[]): tagsArray is Tag[] => {
  const validatedTags = tagsArray.map(tag => {
    if (isTag(tag)) {
      return tag;
    } else {
      throw new Error(`Invalid tag: ${tag}`);
    }
  });
  return SevenWordsValidator(tagsArray.join(' ')) && validatedTags.length > 0;
};

export const zodTag = z.array(z.string()).refine(combineAllValidator)
