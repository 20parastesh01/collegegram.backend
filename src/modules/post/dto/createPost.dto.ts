import { z } from 'zod'
import { zodTag } from '../model/tag';
import { zodCaption } from '../model/caption';
import { zodUserId } from '../../user/model/user-id';

export const zodCreatePostDTO = z.object({
  tags: zodTag,
  caption: zodCaption,
  closeFriend: z.coerce.boolean(),
  images: z.array(z.string()),
  author: zodUserId,
});

export type CreatePostDTO = z.infer<typeof zodCreatePostDTO>;