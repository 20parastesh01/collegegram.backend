import { zodWholeNumber } from '../../../data/whole-number'
import { PostEntity } from '../entity/post.entity'
import { Post, NewPost, BasePost } from '../model/post'
import { CreatePost } from '../post.repository'

export const postOrNullDao = (input: PostEntity | null) => {
    return {
        toPostModel(): Post | null {
            if (input === null) return null
            else {
                // Handle the case when input is a single PostEntity
                const { createdAt, updatedAt, ...rest } = input
                return rest
            }
        },
        toThumbnailModel(): BasePost | null {
            if (input === null) return null
            const { createdAt, updatedAt, caption, likesCount, tags, commentsCount, ...rest } = input
            return rest
        },
    }
}
export const postDao = (input: PostEntity) => {
    return {
        toPostModel(): Post {
            // Handle the case when input is a single PostEntity
            const { createdAt, updatedAt, ...rest } = input
            return rest
        },
    }
}
export const postArrayDao = (input: PostEntity[]) => {
    return {
        toPostModelList(): Post[] {
            // Handle the case when input is an array of PostEntity
            return input.map((entity) => {
                const { createdAt, updatedAt, ...rest } = entity
                return rest
            })
        },
        toThumbnailModelList(): BasePost[] {
            // Handle the case when input is an array of PostEntity
            return input.map((entity) => {
                const { createdAt, updatedAt, caption, likesCount, tags, commentsCount, ...rest } = entity
                return rest
            })
        },
    }
}
export const newPostModelToRepoInput = (post: NewPost): CreatePost => {
    const createPostEntity: CreatePost = {
        likesCount: zodWholeNumber.parse(0), //will not provided in create stage
        commentsCount: zodWholeNumber.parse(0), //will not provided in create stage
        ...post,
    }

    return createPostEntity
}
