import { Request, Response, Router } from 'express'
import { handleExpress } from '../utility/handle-express'
import { CommentService } from '../modules/comment/bll/comment.service'
//import { zodGetCommentDTO } from '../modules/comment/dto/getComment.dto'
import { zodGetAllCommentsDTO } from '../modules/comment/dto/getAllComments.dto'
import { zodCreateCommentDTO } from '../modules/comment/dto/createComment.dto'
import { Route } from '../registry/layer-decorators'
import { Auth, Get, Post, RequestBody } from '../registry/endpoint-decorator'

@Route('/comment', CommentService)
export class CommentRouter {
    constructor(private commentService: CommentService) {}

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
        const data = zodGetAllCommentsDTO.parse(req.params.postId)
        handleExpress(res, () => this.commentService.getAllComments(data))
    }
}
