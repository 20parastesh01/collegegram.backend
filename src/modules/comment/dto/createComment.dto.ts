import { z } from 'zod'
import { zodContent } from '../model/content';
import { zodUserId } from '../../user/model/user-id';
import { zodPostId } from '../../post/model/post-id';
import { zodParentId } from '../model/parent-id';

export const zodCreateCommentDTO = z.object({
  content: zodContent,
  parentId: zodParentId.optional(),
  postId: zodPostId,
});

export type CreateCommentDTO = z.infer<typeof zodCreateCommentDTO>;