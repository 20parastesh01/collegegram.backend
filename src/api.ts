import express, { ErrorRequestHandler } from 'express'
import { DataSource } from 'typeorm'
import { ZodError } from 'zod'
import { SampleRepository } from './modules/sample/sample.repository'
import { SampleService } from './modules/sample/sample.service'
import { makeSampleRouter } from './routes/sample.routes'

export const makeApp = (dataSource: DataSource) => {
    const app = express()

    app.use(express.json())

    const sampleRepo = new SampleRepository(dataSource)
    const sampleService = new SampleService(sampleRepo)

    app.use('/sample', makeSampleRouter(sampleService))

    app.use((req, res) => {
        res.status(404).send({ message: 'Not Found' })
    })

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        if (err instanceof ZodError) {
            res.status(400).send({ message: err.errors })
            return
        }
        res.status(500).send()
    }
    app.use(errorHandler)
    return app
}
