import { Router } from 'express'
import { Route } from '../registry'
import { handleExpress } from '../utility/handle-express'
import { CommentService } from '../modules/comment/bll/comment.service'
//import { zodGetCommentDTO } from '../modules/comment/dto/getComment.dto'
import { zodGetAllCommentsDTO } from '../modules/comment/dto/getAllComments.dto'
import { zodCreateCommentDTO } from '../modules/comment/dto/createComment.dto'



@Route('/comment', CommentService)
export class CommentRouter {
    makeRouter(commentService: CommentService) {
        const app = Router()

        app.post('/create', (req, res) => {
            const mergedData = {
                ...req.body,
                author: req.user.userId,
            };
            const data = zodCreateCommentDTO.parse(mergedData)
            handleExpress(res, () => commentService.createComment(data))
        })

        // app.post('/get/:commentId', (req, res) => {
        //     const data = zodGetCommentDTO.parse(req.params.commentId)
        //     handleExpress(res, () => commentService.getComment(data))
        // })

        app.post('/getAll', (req, res) => {
            const data = zodGetAllCommentsDTO.parse(req.user.userId)
            handleExpress(res, () => commentService.getAllComment(data))
        })

        return app
    }
}
