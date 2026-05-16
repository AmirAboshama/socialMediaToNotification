import dbRebo from "./dpRebo.js"
import type { Ipost } from "../models/post.model.js";
import postModel from "../models/post.model.js";

class postRebo extends dbRebo<Ipost> {
    
constructor(){
    super(postModel );
}



}

export default new  postRebo();