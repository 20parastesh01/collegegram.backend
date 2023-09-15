import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    CreateDateColumn,
    Column,
  } from 'typeorm';
import { LikeId } from '../model/like-id';
import { UserEntity } from '../../user/entity/user.entity';
import { UserId } from '../../user/model/user-id';
import { PostEntity } from '../../post/entity/post.entity';
import { PostId } from '../../post/model/post-id';
  
@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
  id!: LikeId;
  
  @Column()
  user_id!: UserId

  @ManyToOne(() => UserEntity, { eager: true, cascade : true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
  
  @Column()
  post_id!: PostId

  @ManyToOne(() => PostEntity, { eager: true,cascade : true ,onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}