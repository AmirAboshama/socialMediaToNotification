
import {  validationGql } from "../../../middleWares/validationMiddleware.js";
import type { contextType } from "../../gql/type.gql.js";
import PostsService from "../posts.service.js";
import { reactPostScehma } from "./post.gql.validation.js";



class reactPosdtResolver {
  private _postServices = new PostsService();
reactPost = async (parent:any, args:any, context:contextType) => {
  validationGql(reactPostScehma,args);
  const result = await this._postServices.likeDislikePost(
    args.postId,
    args.react,
    context.user
  );

  if (!result) {
    throw new Error("Post not found or access denied");
  }

  return {
    _id: result._id,
    likes: result.likes,
  };
};


}


export default new reactPosdtResolver()