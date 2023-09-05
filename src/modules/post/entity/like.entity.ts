import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    CreateDateColumn,
  } from 'typeorm';
import { LikeId } from '../model/like-id';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from './post.entity';
  
@Entity()
export class Like {
    @PrimaryGeneratedColumn()
    id!: LikeId;


    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;


    @ManyToOne(() => PostEntity)
    @JoinColumn({ name: 'post_id' })
    post!: PostEntity;

@CreateDateColumn()
createdAt!: Date

@UpdateDateColumn()
updatedAt!: Date
}