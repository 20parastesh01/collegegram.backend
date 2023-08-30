import { Request, Response } from 'express'
import { UserService } from '../modules/user/bll/user.service'
import { loginDto } from '../modules/user/dto/login.dto'
import { signupDto } from '../modules/user/dto/signup.dto'
import { Auth, Get, Post, ResponseBody } from '../registry/endpoint-decorator'
import { Route } from '../registry/layer-decorators'
import { handleExpress } from '../utility/handle-express'

@Route('/user', UserService)
export class UserRouter {
    constructor(private userService: UserService) {}

    @Post('/signup')
    signup(req: Request, res: Response) {
        const data = signupDto.parse(req.body)
        handleExpress(res, () => this.userService.signup(data))
    }

    @Post('/login')
    login(req: Request, res: Response) {
        const data = loginDto.parse(req.body)
        handleExpress(res, () => this.userService.login(data))
    }

    @Get('/me')
    @Auth()
    getCurrentUser(req: Request, res: Response) {
        res.send(req.user)
    }
}
