import dotenv from 'dotenv-flow'
dotenv.config({ path: process.cwd() })
import { DataSource } from 'typeorm'
import { Redis } from './redis'
import { UserEntity } from './modules/user/entity/user.entity'
import { EmailEntity } from './modules/email/entity/email.entity'
import { Minio } from './modules/minio/minio.service'
import { CommentEntity } from './modules/comment/entity/comment.entity'
import { PostEntity } from './modules/post/entity/post.entity'
import { RelationEntity } from './modules/user/entity/relation.entity'
import { NotificationEntity } from './modules/notification/entity/notification.entity'
import { BookmarkEntity } from './modules/postAction/entity/bookmark.entity'
import { LikeEntity } from './modules/postAction/entity/like.entity'
import { CommentLikeEntity } from './modules/comment/entity/commentLike.entity'
import { CloseFriendEntity } from './modules/user/entity/closefriend.entity'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [EmailEntity, UserEntity, CommentLikeEntity, CommentEntity, PostEntity, RelationEntity, NotificationEntity, LikeEntity, BookmarkEntity, CloseFriendEntity],
    migrations: ['./src/migration/*.ts'],
    subscribers: [],
})

export const RedisRepo = new Redis()

export const MinioRepo = new Minio()
