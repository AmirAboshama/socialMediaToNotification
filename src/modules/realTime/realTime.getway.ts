import type { Server as httpServer } from "http";
import { Server, type ExtendedError } from "socket.io";
import tokenService from "../../common/security/token.service.js";
import { TokenTypeEnum } from "../../common/enums/tokenEnum.js";
import chatEvents from "../chat/realTime/chat.event.js";
import type { socketTypeInterface } from "../../common/inerfaces/express.interface.js";
import chatGetway from "../chat/realTime/chat,getway.js";
import RedisServices from "../../DB/redis/redis.services.js";



class RealtimeGateway {

  private _tokenService = tokenService
  private _chatEvents = chatEvents
  private _chatGetWay = chatGetway
  private _RedisServices = new RedisServices()
  authantication = async (socket: socketTypeInterface, next: (err?: ExtendedError) => void) => {
    try {
      const { user, verifiedToken } =
        await this._tokenService.checkTocken(
          socket.handshake.auth.authorization,
          TokenTypeEnum.access
        );
      socket.data = { user, verifiedToken }

      await this._RedisServices.addSocketToIdSet(String(user._id), socket.id)



      next()

    } catch (error) {

      // socket.emit("connectionERR",error)
      next(error as ExtendedError)
    }

  }
  initializeIo(server: httpServer) {

    const io = new Server(server, { cors: { origin: "*" } })


    io.use(this.authantication)


    io.on("connection", async (socket: socketTypeInterface) => {

      console.log({ user: socket.data.user })
      console.log({ vertifyTocken: socket.data.verifiedToken })
      // console.log({ socketId: socket.id })
      // console.log({ handshcake: socket.handshake.auth.authorization })
      // tabId.push(socket.id)
      // socket.except([tabId.at(-2)as string]).emit("sayHi","test ")
      // io.except([tabId.at(-1)as string]).emit("sayHi","test ")
      // socket.emit("sayHi","test  ")
      // io.emit("sayHi","test  ")
      // socket.to(tabId).emit("sayHi","test ")
      // io.to([tabId.at(-1)as string,tabId.at(-2)as string]).emit("sayHi","test ")

      this._chatGetWay.registerEvents(socket,io)



      socket.on("disconnection", async () => {


        await this._RedisServices.removeSocketToIdSet(socket.data.user._id.toString(), socket.id)
      })
    })


  }
}

export default new RealtimeGateway()