import { Request, Response, Router } from 'express'
import { UserService } from '../modules/user/bll/user.service'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { authMiddleware } from '../auth-middleware'
import { sendEmailDto } from '../modules/user/dto/send-email.dto'
import { SetPasswordDto, setPasswordDto } from '../modules/user/dto/set-pass.dto'
import { Auth, Get, Post } from '../registry/endpoint-decorator'
import { Route } from '../registry/layer-decorators'

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

    @Post('/forgetpassword')
    forgetpass(req: Request, res: Response) {
        const data = sendEmailDto.parse(req.body)
        handleExpress(res, () => this.userService.forgetPassSendEmail(data))
    }

    @Post('/setnewpassword')
    setNewPassword(req: Request, res: Response) {
        const data = setPasswordDto.parse(req.body)
        handleExpress(res, () => this.userService.forgetPassSetPass(data))
    }
}
