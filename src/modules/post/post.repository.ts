import { DataSource, Repository } from 'typeorm'

import { Repo } from '../../registry'
import { Caption } from './model/caption'
import { Tag } from './model/tag'
import { PostId } from './model/post-id'
import { PostEntity } from './entity/post.entity'

interface CreatePost {
    caption: Caption
    tags: Tag[]
    auther: string //TODO: should be auther
    photos: string[]
    closeFriend: boolean
}

export interface IPostRepository {
    create(data: CreatePost): Promise<PostEntity>
    findByAuther(profileID: string): Promise<PostEntity[] | null>
    findByID(id: PostId): Promise<PostEntity | null>
}

@Repo()
export class PostRepository implements IPostRepository {
    private PostRepo: Repository<PostEntity>

    constructor(appDataSource: DataSource) {
        this.PostRepo = appDataSource.getRepository(PostEntity)
    }
    async findByAuther(profileID: string): Promise<PostEntity[] | null> {
        return this.PostRepo.findBy({ auther:profileID })
    }
    async findByID(id: PostId): Promise<PostEntity | null> {
        return this.PostRepo.findOneBy({ id })
    }
    async create(data: CreatePost): Promise<PostEntity> {
        return this.PostRepo.save( data )
    }
}
