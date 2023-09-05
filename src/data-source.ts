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

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [EmailEntity, UserEntity, CommentEntity, PostEntity, RelationEntity],
    migrations: ['./src/migration/*.ts'],
    subscribers: [],
})

export const RedisRepo = new Redis()

export const MinioRepo = new Minio()
