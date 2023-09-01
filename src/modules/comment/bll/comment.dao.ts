import { zodWholeNumber } from "../../../data/whole-number";
import { CommentEntity } from "../entity/comment.entity";
import { newComment, Comment } from "../model/comment";


export const toCommentModel = (entity: CommentEntity): Comment => {
  const { createdAt, updatedAt, ...rest } = entity;
  return rest;
}

export const newCommentModelToEntity = (comment: newComment): CommentEntity => {
  const {
    parentId = null, // Set parentId to null if not provided
    ...rest
  } = comment;

  const commentEntity = new CommentEntity();
  commentEntity.likesCount = zodWholeNumber.parse(0); //will not provided in create stage
  commentEntity.parentId = parentId
  Object.assign(commentEntity, rest);

  return commentEntity;
};

export const commentModelToEntity = (comment: Comment): CommentEntity => {
  const {
    likesCount = zodWholeNumber.parse(0), // Set likesCount to 0 if not provided
    parentId = null, // Set parentId to null if not provided
    ...rest
  } = comment;

  const commentEntity = new CommentEntity();
  commentEntity.likesCount = likesCount;
  commentEntity.parentId = parentId
  Object.assign(commentEntity, rest);


  return commentEntity;
};