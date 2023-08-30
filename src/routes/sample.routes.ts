import { Request, Response } from 'express'
import { Router } from 'express'
import { SampleService } from '../modules/sample/sample.service'
import { Route } from '../registry/layer-decorators'
import { Get } from '../registry/endpoint-decorator'

@Route('/sample', SampleService)
export class SampleRouter {
    @Get()
    sample(req: Request, res: Response) {
        res.send('yep')
    }

    makeRouter(sampleService: SampleService) {
        const app = Router()

        app.get('/', (req, res) => {})

        return app
    }
}
