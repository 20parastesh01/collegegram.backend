import express, { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppDataSource, RedisRepo } from './src/data-source'
import { scan } from './src/registry/registry'
process.env.ENGINE = process.argv.some((arg) => arg.includes('ts-node')) ? 'TS_NODE' : 'NODE'

const PORT = process.env.PORT || 3000

export const initializeProject = async () => {
    await AppDataSource.initialize()
    await RedisRepo.initialize()
    const app = express()

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
        res.status(500).send()
    }
    app.use(errorHandler)

    app.listen(PORT, () => {
        console.log(`express is listening on port ${PORT}`)
    })
    return app
}
initializeProject()
