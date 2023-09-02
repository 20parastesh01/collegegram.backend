import { Request, Response, Router } from 'express'
import { handleExpress } from '../utility/handle-express'
import { PostService } from '../modules/post/bll/post.service'
import { uploadPostImages } from './middlewares/uploadMultipleImage.middleware'
import { zodCreatePostDTO } from '../modules/post/dto/createPost.dto'
import { zodGetPostDTO } from '../modules/post/dto/getPost.dto'
import { zodGetAllPostsDTO } from '../modules/post/dto/getAllPosts.dto'
import { Route } from '../registry/layer-decorators'
import { Auth, Files, Get, Post, RequestBody } from '../registry/endpoint-decorator'

@Route('/post', PostService)
export class PostRouter {
    constructor(private postService: PostService) {}

    @Post()
    @RequestBody('CreatePostDTO')
    @Files('photos')
    @Auth()
    createPost(req: Request, res: Response) {
        const data = zodCreatePostDTO.parse(req.body)
        const files = (req.files && !Array.isArray(req.files) && req.files['photos']) || []
        handleExpress(res, () => this.postService.createPost(data, files, req.user.userId))
    }

    @Get('/:postId')
    @Auth()
    getAPost(req: Request, res: Response) {
        const data = zodGetPostDTO.parse(req.params.postId)
        handleExpress(res, () => this.postService.getPost(data))
    }

    @Get('/user/:userId')
    @Auth()
    getAllPost(req: Request, res: Response) {
        const data = zodGetAllPostsDTO.parse(req.params.userId)
        handleExpress(res, () => this.postService.getAllPosts(data))
    }
    
}
