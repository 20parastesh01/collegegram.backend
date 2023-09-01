import { Request, Response, Router } from 'express'
import { UserService } from '../modules/user/bll/user.service'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { authMiddleware } from '../auth-middleware'
import { sendEmailDto } from '../modules/user/dto/send-email.dto'
import { SetPasswordDto, setPasswordDto } from '../modules/user/dto/set-pass.dto'
import { Auth, File, Get, Patch, Post, RequestBody } from '../registry/endpoint-decorator'
import { Route } from '../registry/layer-decorators'
import { editProfileDto } from '../modules/user/dto/edit-profile.dto'

@Route('/user', UserService)
export class UserRouter {
    constructor(private userService: UserService) {}
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
        handleExpress(res, () => this.userService.getCurrentUser(req.user.userId))
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

    @Patch('/me')
    @Auth()
    @File('profile')
    @RequestBody('EditProfileDto')
    editProfile(req: Request, res: Response) {
        const data = editProfileDto.parse(req.body)
        const file = req.files ? ((req.files as any)['profile'] ? (req.files as any)['profile'][0] : null) : null
        handleExpress(res, () => this.userService.editProfile(req.user, data, file))
    }

    @Get('/me/profile')
    @Auth()
    getProfilePhoto(req: Request, res: Response) {
        handleExpress(res, () => this.userService.getProfilePhoto(req.user))
    }
}
