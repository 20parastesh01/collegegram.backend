import { z } from 'zod'
import { zodTag } from '../model/tag';
import { zodCaption } from '../model/caption';
import { zodUserId } from '../../user/model/user-id';

export const zodCreatePostDTO = z.object({
  tags: zodTag.optional(),
  caption: zodCaption.optional(),
  closeFriend: z.coerce.boolean().optional(),
  images: z.array(z.string()).optional(),
  author: zodUserId.optional(),
});

export type CreatePostDTO = z.infer<typeof zodCreatePostDTO>;