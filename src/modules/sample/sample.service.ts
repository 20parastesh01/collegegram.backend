import { ISampleRepository } from './sample.repository'

export interface ISampleService {}

export class SampleService implements ISampleService {
    constructor(private sampleRepo: ISampleRepository) {}
}
