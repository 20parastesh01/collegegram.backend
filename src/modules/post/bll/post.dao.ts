import { PostEntity } from "../entity/post.entity"
import { Post } from "../model/post"


export const postEntitytoPost = (input: PostEntity): Post => {
    const { createdAt, updatedAt, ...rest } = input
    return rest
}
