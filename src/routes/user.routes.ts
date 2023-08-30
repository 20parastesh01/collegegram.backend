import { Request, Response, Router } from 'express'
import { UserService } from '../modules/user/bll/user.service'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { authMiddleware } from '../auth-middleware'
import { Route } from '../registry/layer-decorators'
import { Auth, File, Files, Get, Post, RequestBody } from '../registry/endpoint-decorator'
import { MinioRepo } from '../data-source'
import { Minio } from '../minio'

@Route('/user', UserService)
export class UserRouter {
    constructor(private userService: UserService) { }

    @Post('/signup')
    @RequestBody('SignUpDto')
    signup(req: Request, res: Response) {
        const data = signupDto.parse(req.body)
        handleExpress(res, () => this.userService.signup(data))
    }

    @Post('/login')
    @RequestBody('LoginDto')
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
