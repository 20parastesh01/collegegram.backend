import { z } from 'zod'
import { zodTag } from '../model/tag';
import { zodCaption } from '../model/caption';
import { zodUserId } from '../../user/model/user-id';
import { zodWholeNumber } from '../../../data/whole-number';

export const zodCreatePostDTO = z.object({
    tags: zodTag,
    caption: zodCaption,
    closeFriend: z.boolean(),
    images: z.array(z.string()),
    authorId: zodUserId,
  });
  
  export type CreatePostDTO = z.infer<typeof zodCreatePostDTO>;