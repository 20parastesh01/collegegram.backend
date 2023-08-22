import { DataSource, Repository } from 'typeorm'
import { SampleEntity } from './entity/sample.entity'

export interface ISampleRepository {}

export class SampleRepository implements ISampleRepository {
    private sampleRepo: Repository<SampleEntity>

    constructor(appDataSource: DataSource) {
        this.sampleRepo = appDataSource.getRepository(SampleEntity)
    }
}
