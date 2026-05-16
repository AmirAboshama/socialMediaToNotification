import dbRebo from "./dpRebo.js"
import type { IUser } from "../models/user.model.js";
import userModel from "../models/user.model.js";
import { Types } from "mongoose";

class userRebo extends dbRebo<IUser> {
    
constructor(){
    super(userModel);
}

async checkEmailExist(id: Types.ObjectId): Promise<boolean> {

return (await this.findOne({ filter: { _id: id } })) !== null;
}


}

export default new  userRebo();