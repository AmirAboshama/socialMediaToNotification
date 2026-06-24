import chatModel, { type Ichat } from "../models/chat.model.js";
import dbRebo from "./dpRebo.js"

class chatRebo extends dbRebo<Ichat> {
    
constructor(){
    super(chatModel );
}


}
export default new  chatRebo();