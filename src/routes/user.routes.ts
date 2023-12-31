import { Request, Response } from 'express'
import { UserService } from '../modules/user/bll/user.service'
import { signupDto } from '../modules/user/dto/signup.dto'
import { handleExpress } from '../utility/handle-express'
import { loginDto } from '../modules/user/dto/login.dto'
import { sendEmailDto } from '../modules/user/dto/send-email.dto'
import { SetPasswordDto, setPasswordDto } from '../modules/user/dto/set-pass.dto'
import { Auth, Delete, File, Files, Get, Patch, Post, RequestBody } from '../registry/endpoint-decorator'
import { Route } from '../registry/layer-decorators'
import { editProfileDto } from '../modules/user/dto/edit-profile.dto'
import { RelationService } from '../modules/user/bll/relation.service'
import { zodUserId } from '../modules/user/model/user-id'
import { NotificationService } from '../modules/notification/bll/notification.service'
import { BookmarkService } from '../modules/postAction/bll/bookmark.service'
import { PostService } from '../modules/post/bll/post.service'
import { CloseFriendService } from '../modules/user/bll/closefriend.service'
import { extractPaginationInfo } from '../data/pagination'

@Route('/user', UserService, RelationService, BookmarkService, NotificationService, CloseFriendService)
export class UserRouter {
    constructor(
        private userService: UserService,
        private relationService: RelationService,
        private bookmarkService: BookmarkService,
        private notificationService: NotificationService,
        private closeFriendService: CloseFriendService
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

    @Delete('/logout')
    @Auth()
    logout(req: Request, res: Response) {
        handleExpress(res, () => this.userService.logout(req.user.userId))
    }

    @Get('/me')
    @Auth()
    getCurrentUser(req: Request, res: Response) {
        handleExpress(res, () => this.userService.getCurrentUser(req.user.userId))
    }

    @Get('/me/notification')
    @Auth()
    getCurrentUserNotifs(req: Request, res: Response) {
        handleExpress(res, () => this.notificationService.getUserNotificationsWithRelation(req.user.userId))
    }

    @Get('/friends/notification')
    @Auth()
    getFriendsNotifs(req: Request, res: Response) {
        handleExpress(res, () => this.notificationService.getFriendNotification(req.user.userId))
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

    @Get('/myBookmarkeds')
    @Auth()
    getMyBookmarkeds(req: Request, res: Response) {
        handleExpress(res, () => this.bookmarkService.getMyBookmarkeds(req.user.userId))
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

    @Post('/:id/unblock')
    @Auth()
    unblock(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.unblock(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Get('/:id/profile')
    @Auth()
    getTargetUser(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.getTargetUser(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Post('/:id/closefriend')
    @Auth()
    addCloseFriend(req: Request, res: Response) {
        handleExpress(res, () => this.closeFriendService.addCloseFriend(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Delete('/:id/unclosefriend')
    @Auth()
    removeCloseFriend(req: Request, res: Response) {
        handleExpress(res, () => this.closeFriendService.removeCloseFriend(req.user.userId, zodUserId.parse(req.params.id)))
    }

    @Get('/follower')
    @Auth()
    getFollowers(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.getFollowers(req.user.userId, extractPaginationInfo(req)))
    }

    @Get('/following')
    @Auth()
    getFollowings(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.getFollowings(req.user.userId, extractPaginationInfo(req)))
    }

    @Get('/blocked')
    @Auth()
    getBlockeds(req: Request, res: Response) {
        handleExpress(res, () => this.relationService.getBlockeds(req.user.userId, extractPaginationInfo(req)))
    }

    @Get('/closefriend')
    @Auth()
    getCloseFriends(req: Request, res: Response) {
        handleExpress(res, () => this.closeFriendService.getCloseFriends(req.user.userId, extractPaginationInfo(req)))
    }
}
