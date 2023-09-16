import { Request, Response } from 'express'
import { handleExpress } from '../utility/handle-express'
import { PostService } from '../modules/post/bll/post.service'
import { zodCreatePostDTO } from '../modules/post/dto/createPost.dto'
import { zodGetPostDTO } from '../modules/post/dto/getPost.dto'
import { zodGetAllPostsDTO } from '../modules/post/dto/getAllPosts.dto'
import { Route } from '../registry/layer-decorators'
import { Auth, Delete, Files, Get, Post, RequestBody } from '../registry/endpoint-decorator'
import { zodJustId } from '../data/just-id'
import { LikeService } from '../modules/postAction/bll/like.service'
import { BookmarkService } from '../modules/postAction/bll/bookmark.service'

@Route('/post', PostService,LikeService,BookmarkService)
export class PostRouter {
    constructor(private postService: PostService,private likeService: LikeService, private bookmarkService: BookmarkService) {}

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
        const data = zodJustId.parse(req.params.postId)
        handleExpress(res, () => this.postService.getPost(data))
    }

    @Get('/MyPosts')
    @Auth()
    getMyPosts(req: Request, res: Response) {
        handleExpress(res, () => this.postService.getMyPosts(req.user.userId))
    }

    @Get('/user/:userId')
    @Auth()
    getAllPost(req: Request, res: Response) {
        const data = zodJustId.parse(req.params.userId)
        handleExpress(res, () => this.postService.getAllPosts(req.user.userId,  data))
    }

    @Get('/MyTimeline')
    @Auth()
    getMyTimeline(req: Request, res: Response) {
        handleExpress(res, () => this.postService.getMyTimeline(req.user.userId))
    }


    @Post('/:id/like')
    @Auth()
    likeAPost(req: Request, res: Response) {
        handleExpress(res, () => this.likeService.likePost(req.user.userId, zodJustId.parse(req.params.id)))
    }

    @Delete('/:id/unlike')
    @Auth()
    unlikeAPost(req: Request, res: Response) {
        handleExpress(res, () => this.likeService.unlikePost(req.user.userId, zodJustId.parse(req.params.id)))
    }
    @Post('/:id/bookmark')
    @Auth()
    bookmarkAPost(req: Request, res: Response) {
        handleExpress(res, () => this.bookmarkService.bookmarkPost(req.user.userId, zodJustId.parse(req.params.id)))
    }

    @Delete('/:id/unbookmark')
    @Auth()
    unbookmarkAPost(req: Request, res: Response) {
        handleExpress(res, () => this.bookmarkService.unbookmarkPost(req.user.userId, zodJustId.parse(req.params.id)))
    }
}
