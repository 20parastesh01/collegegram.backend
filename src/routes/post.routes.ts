import { Router } from 'express'
import { Route } from '../registry'
import { handleExpress } from '../utility/handle-express'
import { PostService } from '../modules/post/bll/post.service'
import { uploadPostImages } from './middlewares/uploadMultipleImage.middleware'
import { zodCreatePostDTO } from '../modules/post/dto/createPost.dto'
import { zodGetPostDTO } from '../modules/post/dto/getPost.dto'
import { zodGetAllPostsDTO } from '../modules/post/dto/getAllPosts.dto'



@Route('/post', PostService)
export class PostRouter {
    makeRouter(postService: PostService) {
        const app = Router()

        app.post('/create', uploadPostImages, (req, res) => {
            const mergedData = {
                ...req.body,
                author: req.user.userId,
            };
            const data = zodCreatePostDTO.parse(mergedData)
            handleExpress(res, () => postService.createPost(data))
        })

        app.post('/get/:postId', (req, res) => {
            const data = zodGetPostDTO.parse(req.params.postId)
            handleExpress(res, () => postService.getPost(data))
        })

        app.post('/getAll', (req, res) => {
            const data = zodGetAllPostsDTO.parse(req.user.userId)
            handleExpress(res, () => postService.getAllPost(data))
        })

        return app
    }
}
