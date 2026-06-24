import type { Icomment } from "../models/comment.model .js";
import commentModel from "../models/comment.model .js";
import dbRebo from "./dpRebo.js"

class commentRebo extends dbRebo<Icomment> {
    
constructor(){
    super(commentModel );
}


}
export default new  commentRebo();