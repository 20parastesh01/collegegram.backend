declare namespace Express {
    export interface Request {
        user: import('./src/modules/user/model/user').UserBasic
    }
}
