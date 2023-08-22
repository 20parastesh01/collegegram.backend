import { Router } from 'express'
import { handleExpress } from '../utility/handle-express'
import { SampleService } from '../modules/sample/sample.service'

export const makeSampleRouter = (sampleService: SampleService) => {
    const app = Router()

    

    return app
}
