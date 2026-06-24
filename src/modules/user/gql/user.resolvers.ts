
import { roleEnum } from "../../../common/enums/userEnum.js";
import { MapGQLError, unauthorizedError } from "../../../common/exeption/domain.exeption.js";
import userRebo from "../../../DB/Repo/user.Rebo.js";
import authorizationGql from "../../../middleWares/authrization.middleware.js";
import { validationGql } from "../../../middleWares/validationMiddleware.js";
import type { contextType } from "../../gql/type.gql.js";
import { getProfileScehma } from "./user.gql.validation.js";



class userResolver {
  private _userRebo= userRebo 
   userProfile=  async (parent:any,args:{userId:string},context:contextType) => {
//   console.log(args ,context);
    // console.log({ token:context.tokenPayload})


    
if (!context.user) {
  MapGQLError(new unauthorizedError("Login first"));
}

authorizationGql(context.user.role, [roleEnum.User]);
validationGql<{userId:string}>(getProfileScehma,args)

const user = await this._userRebo.findOne({});
          return user;


        }
}


export default new userResolver ()