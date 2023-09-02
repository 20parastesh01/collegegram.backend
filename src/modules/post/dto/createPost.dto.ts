import { z } from 'zod'
import { zodTags } from '../model/tag';
import { zodCaption } from '../model/caption';
import { zodUserId } from '../../user/model/user-id';
import { zodWholeNumber } from '../../../data/whole-number';

export const zodCreatePostDTO = z.object({
  tags: zodTags.optional(),
  caption: zodCaption,
  closeFriend: z.coerce.boolean(),
});

export type CreatePostDTO = z.infer<typeof zodCreatePostDTO>;