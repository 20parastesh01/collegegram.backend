import express, { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppDataSource, MinioRepo, RedisRepo } from './src/data-source'
import multer from 'multer'
import http from 'http'
import { scan } from './src/registry/registry'
import { sendEmail } from './src/utility/send-email'
const storage = multer.memoryStorage() // You can adjust this storage method as needed
export const upload = multer({ storage: storage })
process.env.ENGINE = process.argv.some((arg) => arg.includes('ts-node')) ? 'TS_NODE' : 'NODE'

const PORT = process.env.PORT || 3000

export const initializeProject = async () => {
    const app = express()
    await AppDataSource.initialize()
    await RedisRepo.initialize()
    await MinioRepo.initialize(app)

    app.use(express.json())

    await scan(app)

    app.use((req, res) => {
        res.status(404).send({ message: 'URL Not Found' })
    })

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        if (err instanceof ZodError) {
            res.status(400).send({ message: err.errors })
            return
        }
        console.log(err)
        res.status(500).send()
    }
    app.use(errorHandler)

    app.listen(PORT, () => {
        console.log(`express is listening on port ${PORT}`)
    })
    return app
}
initializeProject()
