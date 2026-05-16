import { Router } from "express";
import succResponse from "../../common/response/succ.response.js";
import cloudFileUpload from "../../common/multer/multer.config.js";
import { validation } from "../../middleWares/validationMiddleware.js";
import { createPostSchema } from "./posts.validation.js";
import PostsService from "./posts.service.js";
import { authMiddleware } from "../../middleWares/auth.middleware.js";


 const postController = Router();
 const postsService = new PostsService();


postController.post(
  "/",
  cloudFileUpload({}).array("attachments", 5),
  validation(createPostSchema),
  async (req, res, next) => {

    const result = await postsService.createPost({
      ...req.body,
      attachments: req.files,
    });

    return succResponse({
      res,
      msg: "Post created successfully",
      data: { post: result }
    });

  }
);

 postController.get("/", authMiddleware(),async (req, res, next) => {  

    const result = await postsService.findPosts();
  return  succResponse({res, msg: "all posts ready to show", data: { posts: result }});

 })

export default postController;