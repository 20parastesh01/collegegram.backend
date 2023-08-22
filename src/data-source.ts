import dotenv from 'dotenv-flow'
dotenv.config({ path: process.cwd() })
console.log(process.env.DB_NAME)
import { DataSource } from 'typeorm'
import { SampleEntity } from './modules/sample/entity/sample.entity'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [SampleEntity],
    migrations: ['./src/migration/*.ts'],
    subscribers: [],
})
