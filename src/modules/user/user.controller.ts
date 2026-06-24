import express from "express";
import UserService from "./user.service.js";
import succResponse from "../../common/response/succ.response.js";
import { validation } from "../../middleWares/validationMiddleware.js";
import { authMiddleware } from "../../middleWares/auth.middleware.js";
import type { IUser } from "../../DB/models/user.model.js";
import { logoutSchema, uploadProfileImageSchema } from "./user.validation.js";
import cloudFileUpload from "../../common/multer/multer.config.js";
import { storageApproachesEnum } from "../../common/enums/multerEnum.js";
import chatController from "../chat/chat.controller.js";

const userController = express.Router()
userController.use("/:userId/chat", chatController);


userController.get("/", authMiddleware(), (req, res) => {
  return succResponse({
    res,
    msg: "auth page",
    data: {
      user: req.user
    }
  });
});
userController.post("/upload-Profile-Picture", authMiddleware(), cloudFileUpload({ storageApproach: storageApproachesEnum.Memory, fileSize: 5 * 1024 * 1024 }).single("profilePicture"), validation(uploadProfileImageSchema) , async (req, res) => {
  // if (req.user.profilePicture) {
  //   await UserService.deleteUser(req.user.profilePicture as any);
  // }
if (!req.file) {
  return res.status(400).json({ message: "No file uploaded" });
}

const result = await UserService.uploadProfileImage(
  req.file,
  req.user as any
);
  return succResponse({ res, msg: "Profile picture uploaded successfully", data: req.file && result, })
})



userController.delete(
  "/deleteUser",
  authMiddleware(),


  async (req, res) => {
    const result = await UserService.deleteUser(req.user as any);
    return succResponse({
      res,
      msg: "Profile picture deleted successfully",
      data: result
    });
  }
);
userController.post(
  "/upload-Profile-Picture",
  authMiddleware(),
  cloudFileUpload({
    storageApproach: storageApproachesEnum.Memory,
    fileSize: 5 * 1024 * 1024
  }).single("profilePicture"),

  async (req, res) => {
    const result = await UserService.uploadProfileImage(
      req.body,
      req.user as any
    );

    return succResponse({
      res,
      msg: "Profile picture uploaded successfully",
      data: result
    });
  }
);
userController.post(
  "/upload-Cover-Images",
  authMiddleware(),
  cloudFileUpload({
    storageApproach: storageApproachesEnum.Memory,
    fileSize: 5 * 1024 * 1024
  }).array("coverimages", 5),

  async (req, res) => {
    const result = await UserService.uploadCoverImage(
      req.files as Express.Multer.File[],
      req.user as any
    );

    return succResponse({
      res,
      msg: "Cover image uploaded successfully",
      data: result
    });
  }
);



// userController.post('/login/gmail',async (req,res)=>{
//     try {
//         const {status,result} = await UserService.loginWithGmail(req.body.idToken)
//         return succResponse({res,statusCode:status,msg:"logged in successfully ",data:result})
//     } catch (error) {
//         return res.status(error.cause?.statusCode || 500).json({msg:"error",error:error.message})
//     }
// })



export default userController