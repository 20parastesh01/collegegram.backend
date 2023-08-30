import { zodWholeNumber } from "../../../data/whole-number";
import { PostEntity } from "../entity/post.entity";
import { Post, newPost, basePost } from "../model/post";
import { isPostId } from "../model/post-id";


export const toPostModel = (entity: PostEntity): Post =>{
    const { createdAt, updatedAt, ...rest } = entity;
    return rest;
  }

export const toThumbnailModel = (entity: PostEntity): basePost => {
    const { createdAt, updatedAt, caption, likesCount, tags, commentsCount, ...rest } = entity;
    return rest;
  }
  
  export const newPostModelToEntity = (post: newPost): PostEntity => {
    const {
        caption,
        tags,
        author,
        photos,
        closeFriend,
    } = post;

    const postEntity = new PostEntity();
    postEntity.caption = caption;
    postEntity.likesCount = zodWholeNumber.parse(0);
    postEntity.tags = tags;
    postEntity.author = author;
    postEntity.photos = photos;
    postEntity.commentsCount = zodWholeNumber.parse(0);
    postEntity.closeFriend = closeFriend;
    
    return postEntity;
};

export const postModelToEntity = (post: Post): PostEntity => {
  const {
      id,
      caption,
      likesCount = zodWholeNumber.parse(0), // Set likesCount to 0 if not provided
      tags,
      author,
      photos,
      commentsCount = zodWholeNumber.parse(0),
      closeFriend,
  } = post;

  const postEntity = new PostEntity();
  postEntity.id = id;
  postEntity.caption = caption;
  postEntity.likesCount = likesCount;
  postEntity.tags = tags;
  postEntity.author = author;
  postEntity.photos = photos;
  postEntity.commentsCount = commentsCount;
  postEntity.closeFriend = closeFriend;
  
  return postEntity;
};