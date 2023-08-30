import { Router } from 'express'
import { Route } from '../registry'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { PostService } from '../modules/post/bll/module.service'
import { uploadPostImages } from './middlewares/uploadMultipleImage.middleware'


@Route('/post', PostService)
export class UserRouter {
    makeRouter(userService: PostService) {
        const app = Router()

        app.post('/create',uploadPostImages, (req, res) => {
            const data = signupDto.parse(req.body)
            handleExpress(res, () => userService.signup(data))
        })

        app.post('/post/getByID', (req, res) => {
            const data = loginDto.parse(req.body)
            handleExpress(res, () => userService.login(data))
        })

        app.post('/post/getAll', (req, res) => {
            const data = loginDto.parse(req.body)
            handleExpress(res, () => userService.login(data))
        })

        return app
    }
}
