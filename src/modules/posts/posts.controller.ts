import { Router } from "express";
import succResponse from "../../common/response/succ.response.js";
import cloudFileUpload from "../../common/multer/multer.config.js";
import { validation } from "../../middleWares/validationMiddleware.js";
import { createPostSchema, reactPostsSchema, updatePostSchema } from "./posts.validation.js";
import PostsService from "./posts.service.js";
import { authMiddleware } from "../../middleWares/auth.middleware.js";
import type { IUser } from "../../DB/models/user.model.js";


const postController = Router();
const postsService = new PostsService();


postController.post(
  "/",
  authMiddleware(),
  cloudFileUpload({}).array("attachments", 5),

  (req, res, next) => {

    req.body.attachments = req.files;

    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = [req.body.tags];
    }

    console.log(req.files);
    console.log(req.body);
    next();
  },

  validation(createPostSchema),

  async (req, res, next) => {

    const result = await postsService.createPost(
      req.body,
      req.user?._id,
      req.files as Express.Multer.File[]
    );
    return succResponse({
      res,
      msg: "Post created successfully",
      data: { post: result }
    });
  }
);

postController.patch(
  "/postId",
  authMiddleware(),
  cloudFileUpload({}).array("attachments", 5),

  (req, res, next) => {

    req.body.attachments = req.files;

    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = [req.body.tags];
    }

    console.log(req.files);
    console.log(req.body);
    next();
  },

  validation(updatePostSchema),

  async (req, res, next) => {

    const result = await postsService.updatePost(
      req.body,
      req.user?._id,
      req.params.postId as string,
      req.files as Express.Multer.File[]
    );
    return succResponse({
      res,
      msg: "Post updated successfully",
      data: { post: result }
    });
  }
);

////////////////////////////likeDislikePost////////////////////////////////////
postController.post(
  "/react-post/:id",
  authMiddleware(),
    validation(reactPostsSchema),

  async (req, res, next) => {

    const result = await postsService.likeDislikePost(
      req.params.id as string,
      req.query.react as string,
      req.user as IUser
    );

    return succResponse({
      res,
      msg: "like/dislike updated successfully",
      data: { post: result }
      });
  }
);


postController.get("/", authMiddleware(), async (req, res, next) => {

  const result = await postsService.findPosts(req.user, req.query);
  return succResponse({ res, msg: "all posts ready to show", data: { posts: result } });

})


export default postController;