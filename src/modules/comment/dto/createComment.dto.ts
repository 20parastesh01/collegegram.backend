import { z } from 'zod'
import { zodContent } from '../model/content';
import { zodUserId } from '../../user/model/user-id';
import { zodPostId } from '../../post/model/post-id';

export const zodCreateCommentDTO = z.object({
  content: zodContent,
  images: z.array(z.string()),
  author: zodUserId,
  postId: zodPostId,
});

export type CreateCommentDTO = z.infer<typeof zodCreateCommentDTO>;