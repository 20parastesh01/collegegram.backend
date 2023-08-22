import { DataSource, Repository } from 'typeorm'
import { SampleEntity } from './entity/sample.entity'
import { Repo } from '../../registry'

export interface ISampleRepository {}

@Repo()
export class SampleRepository implements ISampleRepository {
    private sampleRepo: Repository<SampleEntity>

    constructor(appDataSource: DataSource) {
        this.sampleRepo = appDataSource.getRepository(SampleEntity)
    }
}
