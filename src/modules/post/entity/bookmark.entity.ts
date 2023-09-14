import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    CreateDateColumn,
    Column,
  } from 'typeorm';
import { BookmarkId} from '../model/bookmark-id';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from './post.entity';
import { PostId } from '../model/post-id';
import { UserId } from '../../user/model/user-id';
  
@Entity('bookmarks')
export class BookmarkEntity {
  @PrimaryGeneratedColumn()
  id!: BookmarkId;
  
  @Column()
  user_id!: UserId

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
  
  @Column()
  post_id!: PostId

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}