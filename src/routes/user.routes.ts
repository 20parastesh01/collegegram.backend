import { Router } from 'express'
import { Route } from '../registry'
import { UserService } from '../modules/user/bll/user.service'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { authMiddleware } from '../auth-middleware'

@Route('/user', UserService)
export class UserRouter {
    makeRouter(userService: UserService) {
        const app = Router()

        app.post('/signup', (req, res) => {
            const data = signupDto.parse(req.body)
            handleExpress(res, () => userService.signup(data))
        })

        app.post('/login', (req, res) => {
            const data = loginDto.parse(req.body)
            handleExpress(res, () => userService.login(data))
        })

        app.get('/me', authMiddleware(userService), (req, res) => {
            res.send(req.user)
        })

        return app
    }
}
