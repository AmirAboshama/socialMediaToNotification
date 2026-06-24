import dbRebo from "./dpRebo.js"
import type { Ipost } from "../models/post.model.js";
import postModel from "../models/post.model.js";
import type { IUser } from "../models/user.model.js";
import { postPrivacyEnum } from "../../common/enums/postEnum.js";

class postRebo extends dbRebo<Ipost> {
    
constructor(){
    super(postModel );
}

checkPostPrivacy(user:IUser) {
return [
                {privacyEnum:postPrivacyEnum.PUBLIC},
                {createdBy: {$in:user.friends!}, privacyEnum:postPrivacyEnum.FRIENDS},
                {createdBy:user._id},
                {tags: {$in:[user._id]}}
                
            ]
}
}
export default new  postRebo();