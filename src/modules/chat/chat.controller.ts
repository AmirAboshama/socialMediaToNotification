import { Router } from "express";
import { authMiddleware } from "../../middleWares/auth.middleware.js";
import succResponse from "../../common/response/succ.response.js";
import chatService from "./chat.service.js";
import type { IHUser } from "../../DB/models/user.model.js";
import cloudFileUpload from "../../common/multer/multer.config.js";


const chatController = Router({mergeParams:true});



// chatController.get("/", authMiddleware(), async(req, res) => {
//   const result= await chatService.getChat(req.params.userId as string
//     ,req.user as IHUser)
//   succResponse({res,data:result})
// });
 
chatController.get("/", authMiddleware(), async (req, res) => {
  const result = await chatService.getChat(
    req.params.userId as string,
    req.user as IHUser
  );

  succResponse({ res, data: result });
});
 
chatController.post("/create-group", authMiddleware(),cloudFileUpload({}).single("attachment"), async (req, res) => {
  const result = await chatService.createGroup(
    req.body.participants,
    req.body.group,
    req.file as Express.Multer.File,
    req.user,

   )

  succResponse({ res, data: result });
});
 
chatController.get("/group/:groupId", authMiddleware(), async (req, res) => {
  const result = await chatService.getGroupChat(
     req.params.groupId as string,
    req.user,

   );

  succResponse({ res, data: result });
});
export default chatController;