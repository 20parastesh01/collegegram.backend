import { Service } from '../../registry/layer-decorators'
import { ISampleRepository, SampleRepository } from './sample.repository'

export interface ISampleService {}

@Service(SampleRepository)
export class SampleService implements ISampleService {
    constructor(private sampleRepo: ISampleRepository) {}
}
