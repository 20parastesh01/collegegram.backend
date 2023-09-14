import { Brand } from "./brand"

export type ErrMsg = Brand<string,'Error Message'>
export type Msg = Brand<string,'Message'>

export const PersianErrors = {
    BadRequest: 'درخواست نامعتبر است.' as ErrMsg,
    ServerError: 'خطای سرور رخ داده است.' as ErrMsg,
    Unauthorized: 'شما اجازه دسترسی ندارید.' as ErrMsg,
    InvalidPassword: 'رمز عبور اشتباه است.' as ErrMsg,
    EmailOrUsernameNotFound: 'نام کاربری یا ایمیل در سیستم وجود ندارداست.' as ErrMsg,
    EmailOrUsernameExists: 'نام کاربری یا ایمیل تکراری است.' as ErrMsg,
    EmailInvalidFormat: 'ایمیل صحیح وارد کنید' as ErrMsg,
    UsernameInvalidFormat: 'نام کاربری صحیح وارد کنید' as ErrMsg,
    PasswordInvalidFormat: 'رمز صحیح وارد کنید' as ErrMsg,
    InvalidToken: 'کاربر یافت نشد.' as ErrMsg,
}

export const messages = {
    alreadyRequested: { persian: 'شما قبلا به این کاربر درخواست داده اید' as Msg},
    cantRequest: { persian: 'شما نمیتوانید به این کاربر درخواست بدهید' as Msg},
    alreadyFollowed: { persian: 'شما این کاربر را قبلا دنبال کرده اید' as Msg},
    userNotFound: { persian: 'کاربر مورد نظر یافت نشد' as Msg},
    followSuccess: { persian: 'شما کاربر مورد نظر را دنبال کردید' as Msg},
    requested: { persian: 'درخواست شما ثبت شد' as Msg},
    notFollowing: { persian: 'شما این کاربر را دنبال نمیکردید' as Msg},
    unfollowSuccess: { persian: 'کاربر مورد نظر آنفالو شد' as Msg},
    requestDeleted: { persian: 'درخواست دوستی به کاربر مورد نظر حذف شد' as Msg},
    requestNotFound: { persian: 'درخواست مورد نظر وجود ندارد' as Msg},
    accepted: { persian: 'درخواست مورد نظر قبول شد' as Msg},
    rejected: { persian: 'درخواست مورد نظر حذف شد' as Msg},
    failed: { persian: 'درخواست مورد نظر موفقیت‌آمیز اجرا نشد' as Msg},
    succeeded: { persian: 'درخواست مورد نظر با موفقیت‌ اجرا شد' as Msg},
    blocked: { persian: 'کاربر مورد نظر بلاک شد' as Msg},
    liked: { persian: 'پست مورد نظر لایک شد' as Msg},
    unliked: { persian: 'پست مورد نظر آنلایک شد' as Msg},
    notLikedYet: { persian: 'شما پست مورد نظر را قبلا لایک کرده‌اید' as Msg},
    alreadyLiked: { persian: 'شما پست مورد نظر را قبلا لایک کرده‌اید' as Msg},
    postNotFound: { persian: 'پست مورد نظر یافت نشد' as Msg},
}
