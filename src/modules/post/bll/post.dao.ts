import { zodWholeNumber } from "../../../data/whole-number";
import { PostEntity } from "../entity/post.entity";
import { Post, newPost, basePost } from "../model/post";


export const toPostModel = (entity: PostEntity): Post => {
  const { createdAt, updatedAt, ...rest } = entity;
  return rest;
}

export const toThumbnailModel = (entity: PostEntity): basePost => {
  const { createdAt, updatedAt, caption, likesCount, tags, commentsCount, ...rest } = entity;
  return rest;
}

export const newPostModelToEntity = (post: newPost): PostEntity => {
  
  const postEntity = new PostEntity();
  postEntity.likesCount = zodWholeNumber.parse(0); //will not provided in create stage
  postEntity.commentsCount = zodWholeNumber.parse(0); //will not provided in create stage
  Object.assign(postEntity, post);

  return postEntity;
};

export const postModelToEntity = (post: Post): PostEntity => {
  const {
    likesCount = zodWholeNumber.parse(0), // Set likesCount to 0 if not provided
    commentsCount = zodWholeNumber.parse(0),// Set commentsCount to 0 if not provided
    ...rest
  } = post;

  const postEntity = new PostEntity();
  postEntity.likesCount = likesCount;
  postEntity.commentsCount = commentsCount;
  Object.assign(postEntity, rest);

  return postEntity;
};