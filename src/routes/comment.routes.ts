import { Request, Response, Router } from 'express'
import { handleExpress } from '../utility/handle-express'
import { CommentService } from '../modules/comment/bll/comment.service'
import { zodCreateCommentDTO } from '../modules/comment/dto/createComment.dto'
import { Route } from '../registry/layer-decorators'
import { Auth, Delete, Get, Post, RequestBody } from '../registry/endpoint-decorator'
import { CommentLikeService } from '../modules/comment/bll/commentLike.service'
import { zodJustId } from '../data/just-id'

@Route('/comment', CommentService, CommentLikeService)
export class CommentRouter {
    constructor(
        private commentService: CommentService,
        private commentLikeService: CommentLikeService
    ) {}

    @Post('/')
    @Auth()
    @RequestBody('CreateCommentDTO')
    createComment(req: Request, res: Response) {
        const data = zodCreateCommentDTO.parse(req.body)
        handleExpress(res, () => this.commentService.createComment(data, req.user.userId))
    }

    @Get('/:postId')
    @Auth()
    getAllCommentsByPost(req: Request, res: Response) {
        const data = zodJustId.parse(req.params.postId)
        handleExpress(res, () => this.commentService.getAllComments(data))
    }

    @Post('/:id/like')
    @Auth()
    likeAComment(req: Request, res: Response) {
        handleExpress(res, () => this.commentLikeService.likeComment(req.user.userId, zodJustId.parse(req.params.id)))
    }

    @Delete('/:id/unlike')
    @Auth()
    unlikeAComment(req: Request, res: Response) {
        handleExpress(res, () => this.commentLikeService.unlikeComment(req.user.userId, zodJustId.parse(req.params.id)))
    }
}
