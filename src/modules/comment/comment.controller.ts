import { Router } from "express";
import commentService from "./comment.service.js";
import { authMiddleware } from "../../middleWares/auth.middleware.js";
import cloudFileUpload from "../../common/multer/multer.config.js";
import type { IHUser } from "../../DB/models/user.model.js";
import succResponse from "../../common/response/succ.response.js";


const commentController = Router();
const CommentsService = new commentService();


commentController.post("/:postId", authMiddleware(),
  cloudFileUpload({}).array("attachments", 5), async (req, res) => {

    const result = await CommentsService.createComment(
      req.body,
      req.user as IHUser,
      req.params.postId as string, 
      req.files as Express.Multer.File[]
    );
  
    succResponse({
      res,
      msg: "Comment created successfully",
      data: { comment: result }
    });
}); 
commentController.post("/:postId/replycomment/:commentId", authMiddleware(),
  cloudFileUpload({}).array("attachments", 5), async (req, res) => {
console.log(req.params);
    const result = await CommentsService.createReplyComment(
      req.body,
      req.user as IHUser,
      req.params.postId as string, 
      req.params.commentId as string,
      req.files as Express.Multer.File[]
    );
  
    succResponse({
      res,
      msg: "Reply comment created successfully",
      data: { comment: result }
    });
}); 
commentController.get("/:commentId", authMiddleware(),
  cloudFileUpload({}).array("attachments", 5), async (req, res) => {
console.log(req.params);
    const result = await CommentsService.getComment(
      req.params.commentId as string,
      req.user as IHUser,
   
    );
  
    succResponse({
      res,
      msg: " getComment  or post DataId  successfully",
      data: { comment: result }
    });
}); 
  
 
export default commentController;