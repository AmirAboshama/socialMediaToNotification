import type { Server } from "socket.io"
import type { socketTypeInterface } from "../../../common/inerfaces/express.interface.js"
import chatEvent from "./chat.event.js"


class chatGetWay{
        private _chatEvent= chatEvent

registerEvents(socket:socketTypeInterface,io:Server){
    this._chatEvent.getChatEvent(socket)
    this._chatEvent.sendMessages(socket,io)
    this._chatEvent.sendGroupMessage(socket,io)
    this._chatEvent.joinRoom(socket,io)
}

}



export default new  chatGetWay()