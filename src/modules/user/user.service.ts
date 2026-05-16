import type { JwtPayload } from "jsonwebtoken";
import redisServices from "../../DB/redis/redis.services.js";
import userRebo from "../../DB/Repo/user.Rebo.js";
import { type IHUser } from "../../DB/models/user.model.js";
import tokenService from "../../common/security/token.service.js";
import S3BucketService from "../../common/S3BUCKET/s3Bucket.service.js";
import { storageApproachesEnum } from "../../common/enums/multerEnum.js";
import type { sendMailForgitPassDto } from "./user.Dto.js";


class UserService {
  private _userRepo = userRebo
  private _s3BucketService = new S3BucketService();
  private _redisServices = new redisServices()
  private _tokenService = tokenService;

  async logOut(userId: string | object, tokenData: JwtPayload, logOutOption: String) {

    if (logOutOption == "all") {
      await this._userRepo.updateOne({
        filter: { _id: userId },
        update: { changeCredential: new Date() }
      });
    } else {

      const ttl = Math.floor(tokenData.exp as number - Date.now() / 1000);

      await this._redisServices.set({
        key: this._redisServices.getBlackListTokenKey({ userId: userId as string, tokenId: tokenData.jti as string }),
        value: tokenData.jti as string,
        exValue: ttl
      });

    }
    return true; // 👈 مهم عشان مايرجعش undefined
  }


  async uploadProfileImage(
    file: Express.Multer.File,
    user: IHUser
  ) {
    const { url, key } = await this._s3BucketService.createPresignedUrl({
      contentType: file.mimetype,
      originalName: file.originalname,
      path: `user/${user._id}/profileimages`,
    });

    // await this._userRepo.updateOne({
    //   filter: { _id: user._id },
    //   update: { profilePicture: key }
    // });
    // await this._userRepo.updateOne(
    //   { filter: { _id: user._id }, update: { profilePicture: key } }
    // );


    return { url, key };
  }

  async uploadCoverImage(
    files: Express.Multer.File[],
    user: IHUser
  ) {
    const keys = await this._s3BucketService.uploadFiles({
      files,
      path: `user/${user._id}/coverimages`,
      uploadApproach: storageApproachesEnum.Disk
    });


    await this._userRepo.updateOne({
      filter: { _id: user._id },
      update: { coverPicture: keys }
    });

    return keys;
  }

  async deleteUser(user: IHUser) {
    await user.deleteOne();
    if (user.profilePicture) {
      await this._s3BucketService.deleteFile(user.profilePicture);
    }



  }











}


export default new UserService