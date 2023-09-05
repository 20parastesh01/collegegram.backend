import { Request, Response, Router } from 'express'
import { UserService } from '../modules/user/bll/user.service'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { authMiddleware } from '../auth-middleware'
import { sendEmailDto } from '../modules/user/dto/send-email.dto'
import { SetPasswordDto, setPasswordDto } from '../modules/user/dto/set-pass.dto'
import { Auth, Delete, File, Files, Get, Patch, Post, RequestBody } from '../registry/endpoint-decorator'
import { Route } from '../registry/layer-decorators'
import { editProfileDto } from '../modules/user/dto/edit-profile.dto'
import { RelationService } from '../modules/user/bll/relation.service'
import { zodUserId } from '../modules/user/model/user-id'

@Route('/user', UserService, RelationService)
export class UserRouter {
    constructor(
        private userService: UserService,
        private relationService: RelationService
    ) {}
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
        const file = req.files && !Array.isArray(req.files) && req.files['profile'] ? req.files['profile'][0] : undefined
        handleExpress(res, () => this.userService.editProfile(req.user, data, file))
    }

    @Get('/me/profile')
    @Auth()
    getProfilePhoto(req: Request, res: Response) {
        handleExpress(res, () => this.userService.getProfilePhoto(req.user))
    }

    @Post('/:id/follow')
    @Auth()
    followOrRequestForFollow(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.follow(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Delete('/:id/unfollow')
    @Auth()
    unfollowOrDeleteRequestForFollow(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.unfollow(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Post('/:id/accept')
    @Auth()
    acceptRequest(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.acceptRequest(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Delete('/:id/reject')
    @Auth()
    rejectRequest(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.rejectRequest(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Post('/:id/block')
    @Auth()
    block(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.block(req.user.userId, zodUserId.parse(req.params.id)))
    }
}
