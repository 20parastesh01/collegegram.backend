import { z } from 'zod'
import { zodTag } from '../model/tag';
import { zodCaption } from '../model/content';
import { zodUserId } from '../../user/model/user-id';

export const zodCreatePostDTO = z.object({
  tags: zodTag,
  caption: zodCaption,
  closeFriend: z.boolean(),
  images: z.array(z.string()),
  authorId: zodUserId,
});

export type CreatePostDTO = z.infer<typeof zodCreatePostDTO>;