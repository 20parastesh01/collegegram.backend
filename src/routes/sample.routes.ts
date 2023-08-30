import { Router } from 'express'
import { SampleService } from '../modules/sample/sample.service'
import { Route } from '../registry/layer-decorators'

@Route('/sample', SampleService)
export class SampleRouter {
    makeRouter(sampleService: SampleService) {
        const app = Router()

        app.get('/', (req, res) => {
            res.send('yep')
        })

        return app
    }
}
