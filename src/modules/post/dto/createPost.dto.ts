import { z } from 'zod'

export const createPostDto = z.object({
        
})

export type CreatePostDto = z.infer<typeof createPostDto>
